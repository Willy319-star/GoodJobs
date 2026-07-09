"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  APPLICATION_CATEGORIES,
  APPLICATION_CITIES,
  APPLICATION_SOURCES,
  type ApplicationCategory,
} from "@/lib/constants/applications";
import type { ApplicationActionState } from "@/lib/actions/applications";
import type { JobTrack } from "@/lib/job-track";
import type { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: ApplicationActionState = {
  ok: false,
  message: "",
};

function getSelectValue(value: string | undefined, options: readonly string[], fallback: string) {
  if (!value) {
    return fallback;
  }

  return options.includes(value) ? value : "其他";
}

function getCustomValue(value: string | undefined, options: readonly string[]) {
  if (!value || options.includes(value)) {
    return "";
  }

  return value;
}

export function ApplicationForm({
  application,
  action,
  track,
  submitLabel = "保存记录",
}: {
  application?: Application;
  action: (state: ApplicationActionState, formData: FormData) => Promise<ApplicationActionState>;
  track: JobTrack;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [companyName, setCompanyName] = useState(application?.companyName ?? "");
  const [position, setPosition] = useState(application?.position ?? "");
  const [applyDate, setApplyDate] = useState(application?.applyDate ?? "");
  const [jobUrl, setJobUrl] = useState(application?.jobUrl ?? "");
  const [description, setDescription] = useState(application?.description ?? "");
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [category, setCategory] = useState<ApplicationCategory>((application?.category as ApplicationCategory | undefined) ?? "产品");
  const [cityMode, setCityMode] = useState(getSelectValue(application?.city, APPLICATION_CITIES, "北京"));
  const [customCity, setCustomCity] = useState(getCustomValue(application?.city, APPLICATION_CITIES));
  const [sourceMode, setSourceMode] = useState(getSelectValue(application?.source, APPLICATION_SOURCES, "公司官网"));
  const [customSource, setCustomSource] = useState(getCustomValue(application?.source, APPLICATION_SOURCES));

  const cityValue = useMemo(() => (cityMode === "其他" ? customCity.trim() : cityMode), [cityMode, customCity]);
  const sourceValue = useMemo(() => (sourceMode === "其他" ? customSource.trim() : sourceMode), [sourceMode, customSource]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {application ? <input type="hidden" name="id" value={application.id} /> : null}
      <input type="hidden" name="track" value={application?.track ?? track} />
      <input type="hidden" name="city" value={cityValue} />
      <input type="hidden" name="source" value={sourceValue} />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="companyName">公司名称</FieldLabel>
          <Input
            id="companyName"
            name="companyName"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="例如：腾讯"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="position">岗位名称</FieldLabel>
          <Input
            id="position"
            name="position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="例如：产品经理"
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>岗位类别</FieldLabel>
            <Select name="category" value={category} onValueChange={(value) => setCategory((value ?? "产品") as ApplicationCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {APPLICATION_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>城市</FieldLabel>
            <Select value={cityMode} onValueChange={(value) => setCityMode(value ?? "北京")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {APPLICATION_CITIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {cityMode === "其他" ? (
              <Input
                className="mt-3"
                value={customCity}
                onChange={(event) => setCustomCity(event.target.value)}
                placeholder="例如：香港"
                required
              />
            ) : null}
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>投递渠道</FieldLabel>
            <Select value={sourceMode} onValueChange={(value) => setSourceMode(value ?? "公司官网")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {APPLICATION_SOURCES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {sourceMode === "其他" ? (
              <Input
                className="mt-3"
                value={customSource}
                onChange={(event) => setCustomSource(event.target.value)}
                placeholder="例如：牛客网 / 公众号 / 朋友推荐"
                required
              />
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="applyDate">投递日期</FieldLabel>
            <Input id="applyDate" name="applyDate" type="date" value={applyDate} onChange={(event) => setApplyDate(event.target.value)} required />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="jobUrl">岗位链接</FieldLabel>
          <Input id="jobUrl" name="jobUrl" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://" />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">JD 描述</FieldLabel>
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="粘贴岗位职责、任职要求或关键词"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">备注</FieldLabel>
          <Textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="记录准备重点、内推人、面试提醒等"
          />
          <FieldDescription>状态推进请到时间线中记录，这里只维护首次投递信息。</FieldDescription>
        </Field>
      </FieldGroup>
      {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}