"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { JOB_TRACK_LABELS, type JobTrack } from "@/lib/job-track";
import { cn } from "@/lib/utils";

const tracks: JobTrack[] = ["campus", "internship"];

function getHref(pathname: string, searchParams: URLSearchParams, track: JobTrack) {
  const params = new URLSearchParams(searchParams);

  if (track === "campus") {
    params.delete("track");
  } else {
    params.set("track", track);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function TrackSwitcher({ track }: { track: JobTrack }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex rounded-md border border-blue-100 bg-blue-50/60 p-1">
      {tracks.map((item) => (
        <Link
          key={item}
          href={getHref(pathname, searchParams, item)}
          prefetch
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-blue-700",
            track === item && "bg-background text-blue-700 shadow-sm"
          )}
        >
          {JOB_TRACK_LABELS[item]}
        </Link>
      ))}
    </div>
  );
}
