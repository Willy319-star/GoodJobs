import type { JobTrack } from "@/lib/job-track";
import type {
  ApplicationCategory,
  ApplicationCity,
  ApplicationSource,
  ApplicationStatus,
} from "@/lib/constants/applications";

export type Application = {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  category: ApplicationCategory;
  city: ApplicationCity;
  source: ApplicationSource;
  status: ApplicationStatus;
  track: JobTrack;
  applyDate: string;
  jobUrl?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TimelineEvent = {
  id: string;
  userId: string;
  applicationId: string;
  eventType: string;
  eventDate: string;
  title: string;
  track: JobTrack;
  description?: string;
  createdAt: string;
};

export type Interview = {
  id: string;
  userId: string;
  applicationId: string;
  round: string;
  interviewDate: string;
  questions?: string;
  answers?: string;
  notes?: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
};

export type Reminder = {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  remindAt: string;
  type: string;
  track: JobTrack;
  readAt?: string;
  isDone: boolean;
  createdAt: string;
};
