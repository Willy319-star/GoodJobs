"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Application } from "@/types/application";
import { createReminderAction, type ReminderActionState } from "@/lib/actions/reminders";
import type { JobTrack } from "@/lib/job-track";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState: ReminderActionState = {
  ok: false,
  message: "",
};

const reminderTypes = ["测评", "笔试", "面试", "复盘", "截止日期", "其他"] as const;
type ReminderType = (typeof reminderTypes)[number];

export function ReminderForm({ applications, track }: { applications: Application[]; track: JobTrack }) {
  const [state, formAction, isPending] = useActionState(createReminderAction, initialState);
  const [type, setType] = useState<ReminderType>("面试");
  const [applicationId, setApplicationId] = useState("none");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="track" value={track} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">提醒内容</FieldLabel>
          <Input id="title" name="title" placeholder="例如：腾讯一面 / 字节笔试 / 简历投递截止" required />
          <FieldDescription>写一句你未来要处理的事情。</FieldDescription>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>提醒类型</FieldLabel>
            <Select name="type" value={type} onValueChange={(value) => setType((value ?? "面试") as ReminderType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {reminderTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="remindAt">提醒时间</FieldLabel>
            <Input id="remindAt" name="remindAt" type="datetime-local" required />
          </Field>
        </div>
        <Field>
          <FieldLabel>关联投递记录</FieldLabel>
          <Select name="applicationId" value={applicationId} onValueChange={(value) => setApplicationId(value ?? "none")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="可选" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">不关联投递记录</SelectItem>
                {applications.map((application) => (
                  <SelectItem key={application.id} value={application.id}>
                    {application.companyName} / {application.position}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>这里只会显示当前工作区的投递记录。</FieldDescription>
        </Field>
      </FieldGroup>

      {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
          保存提醒
        </Button>
      </div>
    </form>
  );
}