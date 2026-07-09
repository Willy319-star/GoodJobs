import { ApplicationsTable } from "@/components/applications/applications-table";
import { PageHeading } from "@/components/layout/page-heading";
import { AppShell } from "@/components/layout/app-shell";
import { getApplications } from "@/lib/data/applications";
import { JOB_TRACK_LABELS, normalizeJobTrack } from "@/lib/job-track";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getPageTrack(searchParams?: PageProps["searchParams"]) {
  const params = await searchParams;
  const value = Array.isArray(params?.track) ? params?.track[0] : params?.track;
  return normalizeJobTrack(value);
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const track = await getPageTrack(searchParams);
  const applications = await getApplications(track);
  const label = JOB_TRACK_LABELS[track];

  return (
    <AppShell track={track}>
      <div className="flex flex-col gap-6">
        <PageHeading
          title={`${label}投递记录`}
          description={`集中管理${label}第一次投递的信息，包括公司、岗位、城市、渠道、投递日期和岗位链接。状态推进请到时间线记录。`}
        />
        <ApplicationsTable applications={applications} track={track} />
      </div>
    </AppShell>
  );
}