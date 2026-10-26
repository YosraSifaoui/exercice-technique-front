// Domain types mirroring the mock API contract (see /API.md).

export interface MajorDomain {
  code: string;
  label: string;
}
export interface ProfessionalDomain {
  code: string;
  label: string;
}
export interface Job {
  code: string;
  label: string;
  major_domain: MajorDomain;
  professional_domain: ProfessionalDomain;
  appellations?: string[];
}

export interface Headset {
  id: string;
  name: string;
}
export interface Audience {
  id: string;
  label: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  jobs: string[];
  audiences: string[];
  compatible_headsets: string[];
  thumbnail_url: string | null;
  published_at: string;
}

export interface Session {
  id: string;
  name: string;
  video_ids: string[];
  headset_id: string | null;
  created_at: string;
  total_duration_seconds: number;
}

// API envelope shapes.
export interface Paginated<T> {
  data: T[];
  meta: { page: number; per_page: number; total: number; total_pages: number };
}
export interface ListResponse<T> {
  data: T[];
}
export interface JobsResponse {
  data: Job[];
  source: string;
}
// Input to POST /sessions.
export interface SessionInput {
  name: string;
  video_ids: string[];
  headset_id: string | null;
}
