import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden border-blue-100/90 bg-white/90 shadow-sm shadow-blue-950/5 transition-colors hover:border-blue-200">
      <div className="h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <span className="flex size-9 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Icon className="size-4" data-icon="inline-end" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-semibold tracking-tight text-blue-700">{value}</span>
          <span className="pb-1 text-sm text-muted-foreground">{helper}</span>
        </div>
      </CardContent>
    </Card>
  );
}
