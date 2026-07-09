"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, LayoutGrid, Pencil, Plus, Search, Table2 } from "lucide-react";
import {
  createApplicationAction,
  deleteApplicationAction,
  updateApplicationAction,
} from "@/lib/actions/applications";
import { APPLICATION_STATUSES } from "@/lib/constants/applications";
import { formatDate } from "@/lib/application-utils";
import type { Application } from "@/types/application";
import type { JobTrack } from "@/lib/job-track";
import { ApplicationForm } from "@/components/applications/application-form";
import { StatusBadge } from "@/components/applications/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const allStatuses = "全部状态";
const boardStatuses = APPLICATION_STATUSES;

function normalizeExternalUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function ApplicationSourceCell({ application }: { application: Application }) {
  if (application.source === "公司官网" && application.jobUrl) {
    return (
      <a
        href={normalizeExternalUrl(application.jobUrl)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
      >
        公司官网
        <ExternalLink className="size-3.5" />
      </a>
    );
  }

  return <span>{application.source}</span>;
}

export function ApplicationsTable({ applications, track }: { applications: Application[]; track: JobTrack }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(allStatuses);
  const [sortDesc, setSortDesc] = useState(true);
  const [view, setView] = useState<"table" | "board">("table");

  const statusOptions = APPLICATION_STATUSES;
  const fixedStatusSet = useMemo(() => new Set<string>(APPLICATION_STATUSES), []);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((application) => application.companyName.includes(query.trim()) || application.position.includes(query.trim()))
      .filter((application) => {
        if (status === allStatuses) {
          return true;
        }

        if (status === "其他") {
          return application.status === "其他" || !fixedStatusSet.has(application.status);
        }

        return application.status === status;
      })
      .sort((a, b) => {
        const diff = new Date(a.applyDate).getTime() - new Date(b.applyDate).getTime();
        return sortDesc ? -diff : diff;
      });
  }, [applications, fixedStatusSet, query, sortDesc, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px] lg:w-[520px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="搜索公司或岗位" />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value ?? allStatuses)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={allStatuses}>{allStatuses}</SelectItem>
                {statusOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-blue-100 bg-blue-50/60 p-1">
            <Button
              type="button"
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              className={view === "table" ? "bg-background text-blue-700 shadow-sm" : "text-muted-foreground hover:text-blue-700"}
              onClick={() => setView("table")}
            >
              <Table2 data-icon="inline-start" />
              表格
            </Button>
            <Button
              type="button"
              variant={view === "board" ? "secondary" : "ghost"}
              size="sm"
              className={view === "board" ? "bg-background text-blue-700 shadow-sm" : "text-muted-foreground hover:text-blue-700"}
              onClick={() => setView("board")}
            >
              <LayoutGrid data-icon="inline-start" />
              看板
            </Button>
          </div>
          <Button variant="outline" onClick={() => setSortDesc((value) => !value)}>
            <ArrowUpDown data-icon="inline-start" />
            {sortDesc ? "最新优先" : "最早优先"}
          </Button>
          <Dialog>
            <DialogTrigger render={<Button />}>
              <Plus data-icon="inline-start" />
              新增投递
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>新增投递记录</DialogTitle>
                <DialogDescription>记录第一次投递的信息。如果是官网投递，可以填写岗位链接，列表里会把公司官网显示为可点击链接。</DialogDescription>
              </DialogHeader>
              <ApplicationForm action={createApplicationAction} track={track} submitLabel="保存投递" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "board" ? (
        <ApplicationsBoard applications={filteredApplications} track={track} fixedStatusSet={fixedStatusSet} />
      ) : (
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>公司 / 岗位</TableHead>
              <TableHead className="hidden md:table-cell">类别</TableHead>
              <TableHead className="hidden md:table-cell">城市</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="hidden lg:table-cell">渠道</TableHead>
              <TableHead className="hidden lg:table-cell">投递日期</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Link href={`/applications/${application.id}`} className="flex flex-col gap-1 hover:text-primary">
                      <span className="font-medium">{application.companyName}</span>
                      <span className="text-sm text-muted-foreground">{application.position}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{application.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{application.city}</TableCell>
                  <TableCell>
                    <StatusBadge status={application.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    <ApplicationSourceCell application={application} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(application.applyDate)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="编辑记录" />}>
                        <Pencil />
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>编辑投递记录</DialogTitle>
                          <DialogDescription>修改公司、岗位、投递日期、链接和备注。状态变更请到时间线记录。</DialogDescription>
                        </DialogHeader>
                        <ApplicationForm application={application} action={updateApplicationAction} track={track} submitLabel="保存修改" />
                        <form action={deleteApplicationAction} className="border-t pt-4">
                          <input type="hidden" name="id" value={application.id} />
                          <input type="hidden" name="track" value={track} />
                          <Button type="submit" variant="destructive">
                            删除记录
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  还没有投递记录。点击“新增投递”开始记录第一家公司。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
}

function getBoardStatus(application: Application, fixedStatusSet: Set<string>) {
  if (application.status === "其他" || !fixedStatusSet.has(application.status)) {
    return "其他";
  }

  return application.status;
}

function ApplicationsBoard({
  applications,
  track,
  fixedStatusSet,
}: {
  applications: Application[];
  track: JobTrack;
  fixedStatusSet: Set<string>;
}) {
  const applicationsByStatus = useMemo(() => {
    const groups = new Map<string, Application[]>();
    boardStatuses.forEach((status) => groups.set(status, []));

    applications.forEach((application) => {
      const boardStatus = getBoardStatus(application, fixedStatusSet);
      groups.get(boardStatus)?.push(application);
    });

    return groups;
  }, [applications, fixedStatusSet]);

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        当前筛选条件下没有投递记录。可以换个状态或搜索关键词看看。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card p-4">
      <div className="grid min-w-[1180px] grid-cols-10 gap-3">
        {boardStatuses.map((status) => {
          const columnApplications = applicationsByStatus.get(status) ?? [];
          return (
            <section key={status} className="flex min-h-[360px] flex-col rounded-lg border border-blue-100 bg-blue-50/40">
              <div className="flex items-center justify-between border-b border-blue-100 px-3 py-3">
                <h3 className="text-sm font-semibold">{status}</h3>
                <Badge variant="secondary" className="bg-background text-blue-700">
                  {columnApplications.length}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3">
                {columnApplications.length > 0 ? columnApplications.map((application) => (
                  <article key={application.id} className="rounded-md border bg-background p-3 shadow-sm">
                    <Link href={`/applications/${application.id}`} className="block hover:text-primary">
                      <p className="truncate font-medium">{application.companyName}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{application.position}</p>
                    </Link>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{application.category}</Badge>
                      <Badge variant="outline">{application.city}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(application.applyDate)}</span>
                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="编辑记录" className="size-8" />}>
                          <Pencil className="size-4" />
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>编辑投递记录</DialogTitle>
                            <DialogDescription>修改公司、岗位、投递日期、链接和备注。状态变更请到时间线记录。</DialogDescription>
                          </DialogHeader>
                          <ApplicationForm application={application} action={updateApplicationAction} track={track} submitLabel="保存修改" />
                          <form action={deleteApplicationAction} className="border-t pt-4">
                            <input type="hidden" name="id" value={application.id} />
                            <input type="hidden" name="track" value={track} />
                            <Button type="submit" variant="destructive">
                              删除记录
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-md border border-dashed bg-background/70 p-3 text-xs text-muted-foreground">
                    暂无记录
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
