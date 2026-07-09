"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import { APPLICATION_STATUSES } from "@/lib/constants/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getSelectValue(value: string, options: readonly string[]) {
  return options.includes(value) ? value : "其他";
}

function getCustomValue(value: string, options: readonly string[]) {
  return options.includes(value) ? "" : value;
}

export function TimelineStatusForm({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const [statusMode, setStatusMode] = useState(getSelectValue(currentStatus, APPLICATION_STATUSES));
  const [customStatus, setCustomStatus] = useState(getCustomValue(currentStatus, APPLICATION_STATUSES));
  const statusValue = useMemo(
    () => (statusMode === "其他" ? customStatus.trim() || "其他" : statusMode),
    [customStatus, statusMode]
  );

  return (
    <form action={updateApplicationStatusAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="id" value={applicationId} />
      <input type="hidden" name="status" value={statusValue} />
      <div className="grid gap-2 sm:grid-cols-[160px_190px]">
        <Select value={statusMode} onValueChange={(value) => setStatusMode(value ?? currentStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择新状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {APPLICATION_STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {statusMode === "其他" ? (
          <Input value={customStatus} onChange={(event) => setCustomStatus(event.target.value)} placeholder="例如：第四面" />
        ) : null}
      </div>
      <Button type="submit" size="sm" className="shrink-0">
        <Check data-icon="inline-start" />
        记录状态
      </Button>
    </form>
  );
}