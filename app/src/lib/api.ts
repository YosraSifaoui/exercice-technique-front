// Simple fetch wrapper for the catalogue API.
// In dev, Vite proxies /videos, /jobs, etc. to localhost:4000.

import type {
  Audience,
  Headset,
  JobsResponse,
  ListResponse,
  Paginated,
  Session,
  SessionInput,
  Video,
} from './types';

const BASE = import.meta.env.VITE_API_BASE ?? '';

// Error with the API's error body attached, so the UI can show details.
export class ApiError extends Error {
  status: number;
  body: { error: string; message?: string; details?: { field: string; message: string }[] };
  constructor(status: number, body: ApiError['body']) {
    super(body.message ?? body.error ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

// Extract a human-readable message from an ApiError (or any error).
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.body.message ?? fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  }).catch(() => {
    throw new ApiError(0, { error: 'network_error', message: "Le serveur est injoignable. Vérifiez qu'il est démarré." });
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(res.status, { error: 'invalid_response', message: 'Réponse non JSON du serveur.' });
  }

  if (!res.ok) {
    const errorBody = (json ?? { error: 'http_error', message: `Erreur ${res.status}` }) as {
      error: string;
      message?: string;
      details?: { field: string; message: string }[];
    };
    throw new ApiError(res.status, errorBody);
  }
  return json as T;
}

export interface VideoQuery {
  q?: string;
  job?: string;
  headset?: string;
  audience?: string;
  page?: number;
  per_page?: number;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}

export const api = {
  videos: (params: VideoQuery = {}) =>
    fetchJson<Paginated<Video>>(`/videos${toQuery(params as Record<string, string | number | undefined>)}`),
  video: (id: string) => fetchJson<Video>(`/videos/${id}`),
  jobs: () => fetchJson<JobsResponse>('/jobs'),
  headsets: () => fetchJson<ListResponse<Headset>>('/headsets'),
  audiences: () => fetchJson<ListResponse<Audience>>('/audiences'),
  sessions: () => fetchJson<ListResponse<Session>>('/sessions'),
  session: (id: string) => fetchJson<Session>(`/sessions/${id}`),
  createSession: (input: SessionInput) =>
    fetchJson<Session>('/sessions', { method: 'POST', body: JSON.stringify(input) }),
};
