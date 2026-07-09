export const JOB_TRACKS = ["campus", "internship"] as const;

export type JobTrack = (typeof JOB_TRACKS)[number];

export const DEFAULT_JOB_TRACK: JobTrack = "campus";

export const JOB_TRACK_LABELS: Record<JobTrack, string> = {
  campus: "秋招",
  internship: "实习",
};

export function normalizeJobTrack(value: string | null | undefined): JobTrack {
  return value === "internship" ? "internship" : "campus";
}

export function getTrackQuery(track: JobTrack) {
  return track === DEFAULT_JOB_TRACK ? "" : `?track=${track}`;
}

export function withTrack(path: string, track: JobTrack) {
  return `${path}${getTrackQuery(track)}`;
}