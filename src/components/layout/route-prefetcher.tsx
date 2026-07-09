"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withTrack, type JobTrack } from "@/lib/job-track";

const mainRoutes = ["/dashboard", "/applications", "/timeline", "/calendar"];

export function RoutePrefetcher({ track }: { track: JobTrack }) {
  const router = useRouter();

  useEffect(() => {
    const prefetchCurrentWorkspace = () => {
      for (const route of mainRoutes) {
        router.prefetch(withTrack(route, track));
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetchCurrentWorkspace, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeout = globalThis.setTimeout(prefetchCurrentWorkspace, 300);

    return () => globalThis.clearTimeout(timeout);
  }, [router, track]);

  return null;
}
