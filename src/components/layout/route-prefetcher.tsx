"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withTrack, type JobTrack } from "@/lib/job-track";

const mainRoutes = ["/dashboard", "/applications", "/timeline", "/calendar"];
const tracks: JobTrack[] = ["campus", "internship"];

export function RoutePrefetcher({ track }: { track: JobTrack }) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const orderedTracks = [track, ...tracks.filter((item) => item !== track)];

      for (const item of orderedTracks) {
        for (const route of mainRoutes) {
          router.prefetch(withTrack(route, item));
        }
      }
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [router, track]);

  return null;
}