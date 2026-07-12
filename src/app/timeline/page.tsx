import { PageHeading } from "@/components/layout/page-heading";
import { AppShell } from "@/components/layout/app-shell";
import { TimelineList, type TimelineGroup } from "@/components/timeline/timeline-list";
import { Card, CardContent } from "@/components/ui/card";
import { getApplications, getTimelineEvents } from "@/lib/data/applications";
import { JOB_TRACK_LABELS, normalizeJobTrack } from "@/lib/job-track";
import type { Application, TimelineEvent } from "@/types/application";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getPageTrack(searchParams?: PageProps["searchParams"]) {
  const params = await searchParams;
  const value = Array.isArray(params?.track) ? params?.track[0] : params?.track;
  return normalizeJobTrack(value);
}

function getEventSortTime(event: TimelineEvent) {
  const eventDateTime = new Date(event.eventDate).getTime();
  const createdTime = new Date(event.createdAt).getTime();

  return Number.isNaN(createdTime) ? eventDateTime : eventDateTime + createdTime / 100000000;
}

function groupEventsByApplication(applications: Application[], timelineEvents: TimelineEvent[]): TimelineGroup[] {
  const applicationById = new Map(applications.map((application) => [application.id, application]));
  const groups = new Map<string, TimelineGroup>();

  for (const event of timelineEvents) {
    const application = applicationById.get(event.applicationId);

    if (!application) {
      continue;
    }

    const eventTime = getEventSortTime(event);
    const existingGroup = groups.get(application.id);

    if (existingGroup) {
      existingGroup.events.push(event);
      existingGroup.lastEventTime = Math.max(existingGroup.lastEventTime, eventTime);
      continue;
    }

    groups.set(application.id, {
      application,
      events: [event],
      lastEventTime: eventTime,
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      events: group.events.toSorted((a, b) => getEventSortTime(a) - getEventSortTime(b)),
    }))
    .toSorted((a, b) => b.lastEventTime - a.lastEventTime);
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const track = await getPageTrack(searchParams);
  const label = JOB_TRACK_LABELS[track];
  const [applications, timelineEvents] = await Promise.all([getApplications(track), getTimelineEvents(track)]);
  const timelineGroups = groupEventsByApplication(applications, timelineEvents);

  return (
    <AppShell track={track}>
      <div className="flex flex-col gap-6">
        <PageHeading
          title={`${label}\u65f6\u95f4\u7ebf`}
          description={`\u5728\u8fd9\u91cc\u63a8\u8fdb${label}\u72b6\u6001\u3002\u6295\u9012\u8bb0\u5f55\u53ea\u4fdd\u5b58\u7b2c\u4e00\u6b21\u6295\u9012\u4fe1\u606f\uff0c\u540e\u7eed\u6d4b\u8bc4\u3001\u7b14\u8bd5\u3001\u9762\u8bd5\u3001Offer \u7b49\u53d8\u5316\u90fd\u4f1a\u6309\u4fee\u6539\u5f53\u5929\u5199\u5165\u65f6\u95f4\u7ebf\u3002`}
        />

        {timelineGroups.length > 0 ? (
          <TimelineList groups={timelineGroups} track={track} />
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              暂无时间线事件。新增投递后，这里会自动出现完整流程。
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
