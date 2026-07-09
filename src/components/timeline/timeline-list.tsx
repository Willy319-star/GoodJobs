"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import { StatusBadge } from "@/components/applications/status-badge";
import { TimelineStatusForm } from "@/components/timeline/timeline-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatFullDate } from "@/lib/application-utils";
import { type JobTrack, withTrack } from "@/lib/job-track";
import type { Application, TimelineEvent } from "@/types/application";

export type TimelineGroup = {
  application: Application;
  events: TimelineEvent[];
  lastEventTime: number;
};

export function TimelineList({ groups, track }: { groups: TimelineGroup[]; track: JobTrack }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) {
      return groups;
    }

    return groups.filter(({ application, events }) => {
      const haystack = [
        application.companyName,
        application.position,
        application.status,
        ...events.flatMap((event) => [event.title, event.description ?? "", event.eventType, event.eventDate]),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [groups, normalizedQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="搜索公司、岗位、状态或时间线内容" />
        </div>
        <p className="text-sm text-muted-foreground">
          显示 {filteredGroups.length} / {groups.length} 条投递流程
        </p>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid gap-4">
          {filteredGroups.map((group) => {
            const latestEvent = group.events[group.events.length - 1];

            return (
              <Card key={group.application.id}>
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={withTrack(`/applications/${group.application.id}`, track)} prefetch className="text-lg font-semibold hover:text-primary">
                          {group.application.companyName}
                        </Link>
                        <StatusBadge status={group.application.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{group.application.position}</p>
                    </div>
                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{group.events.length} 个节点</Badge>
                        <Badge variant="outline">最近：{formatFullDate(latestEvent.eventDate)}</Badge>
                      </div>
                      <TimelineStatusForm applicationId={group.application.id} currentStatus={group.application.status} />
                    </div>
                  </div>

                  <div className="mt-5">
                    {group.events.map((event, index) => {
                      const isLast = index === group.events.length - 1;

                      return (
                        <div key={event.id} className="grid gap-4 md:grid-cols-[150px_1fr]">
                          <div className="flex items-start gap-2 pb-6 text-sm text-muted-foreground md:block">
                            <CalendarClock data-icon="inline-start" className="mt-0.5 md:mb-2" />
                            <span>{formatFullDate(event.eventDate)}</span>
                          </div>
                          <div className="relative border-l pb-6 pl-6">
                            <span className="absolute -left-1.5 top-1.5 size-3 rounded-full bg-primary" />
                            {!isLast ? <span className="absolute -left-px top-4 h-[calc(100%-1rem)] border-l" /> : null}
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="font-medium leading-6">{event.title}</p>
                                {event.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p> : null}
                              </div>
                              <Badge variant="secondary" className="w-fit shrink-0">
                                {event.eventType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            没有匹配的时间线。换个公司、岗位或状态关键词试试。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
