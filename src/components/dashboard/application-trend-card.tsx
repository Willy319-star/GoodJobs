"use client";

import { useMemo, useState } from "react";
import { CalendarDays, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendMode = "week" | "month";

type TrendPoint = {
  label: string;
  value: number;
};

const weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMonday(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = startOfDay(date);
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function buildWeekData(applyDates: Date[]) {
  const monday = getMonday(new Date());

  return weekLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      label,
      value: applyDates.filter((applyDate) => isSameDay(applyDate, date)).length,
    };
  });
}

function buildMonthData(applyDates: Date[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month, index + 1);
    return {
      label: `${index + 1}`,
      value: applyDates.filter((applyDate) => isSameDay(applyDate, date)).length,
    };
  });
}

function getTrendPath(points: TrendPoint[], width: number, height: number, padding: number) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : padding + (plotWidth * index) / (points.length - 1);
    const y = padding + plotHeight - (point.value / maxValue) * plotHeight;
    return { x, y, value: point.value };
  });

  const linePath = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coordinates.at(-1)?.x.toFixed(1) ?? padding} ${height - padding} L ${coordinates[0]?.x.toFixed(1) ?? padding} ${height - padding} Z`;

  return { coordinates, linePath, areaPath, maxValue };
}

export function ApplicationTrendCard({ applyDates }: { applyDates: string[] }) {
  const [mode, setMode] = useState<TrendMode>("week");
  const parsedApplyDates = useMemo(() => applyDates.map((date) => startOfDay(new Date(date))), [applyDates]);
  const points = useMemo(() => (mode === "week" ? buildWeekData(parsedApplyDates) : buildMonthData(parsedApplyDates)), [mode, parsedApplyDates]);
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const allTimeTotal = applyDates.length;

  const width = 960;
  const height = 280;
  const padding = 34;
  const { coordinates, linePath, areaPath, maxValue } = getTrendPath(points, width, height, padding);
  const gridValues = [maxValue, Math.ceil(maxValue * 0.66), Math.ceil(maxValue * 0.33), 0].filter((value, index, values) => values.indexOf(value) === index);

  const visibleLabels = mode === "week"
    ? new Set(points.map((point) => point.label))
    : new Set(["1", "7", "14", "21", "28", `${points.length}`]);

  return (
    <Card className="border-blue-100 bg-gradient-to-br from-blue-50/70 via-background to-background">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <TrendingUp className="size-4" />
            </span>
            <CardTitle>{mode === "week" ? "本周投递趋势" : "本月投递趋势"}</CardTitle>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            按{mode === "week" ? "天" : "日期"}查看当前{mode === "week" ? "本周" : "本月"}投递节奏，顶部指标展示的是累计投递。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-blue-100 bg-blue-50/70 p-1">
            {(["week", "month"] as const).map((item) => (
              <Button
                key={item}
                type="button"
                variant={mode === item ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  mode === item ? "bg-background text-blue-700 shadow-sm" : "text-muted-foreground hover:text-blue-700",
                )}
                onClick={() => setMode(item)}
              >
                {item === "week" ? "本周" : "本月"}
              </Button>
            ))}
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            {mode === "week" ? "本周" : "本月"} {total} 个
          </Badge>
          <Badge variant="outline" className="border-blue-100 bg-background text-blue-700">
            累计 {allTimeTotal} 个
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="rounded-lg bg-background/70 p-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label={`${mode === "week" ? "本周" : "本月"}投递趋势`}>
              <defs>
                <linearGradient id="goodjobs-trend-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="goodjobs-trend-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {gridValues.map((value) => {
                const y = padding + (height - padding * 2) * (1 - value / Math.max(maxValue, 1));
                return (
                  <g key={value}>
                    <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#BFDBFE" strokeDasharray="7 9" />
                    <text x={padding - 20} y={y + 5} textAnchor="end" className="fill-slate-500 text-[14px]">
                      {value}
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#goodjobs-trend-area)" />
              <path d={linePath} fill="none" stroke="url(#goodjobs-trend-line)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              {coordinates.map((point, index) => (
                <g key={`${points[index]?.label}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="7" fill="white" stroke="#4F46E5" strokeWidth="4" />
                  {point.value > 0 ? (
                    <text x={point.x} y={point.y - 18} textAnchor="middle" className="fill-slate-950 text-[18px] font-semibold">
                      {point.value}
                    </text>
                  ) : null}
                  {visibleLabels.has(points[index]?.label ?? "") ? (
                    <text x={point.x} y={height - 7} textAnchor="middle" className="fill-slate-500 text-[14px]">
                      {mode === "week" ? points[index]?.label : `${points[index]?.label}日`}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-background/70 text-center">
            <CalendarDays className="size-9 text-blue-500" />
            <p className="mt-3 font-medium">这个{mode === "week" ? "星期" : "月份"}还没有投递记录</p>
            <p className="mt-1 text-sm text-muted-foreground">新增投递后，这里会自动生成趋势图。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
