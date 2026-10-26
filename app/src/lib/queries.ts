// TanStack Query hooks for the catalogue API.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type VideoQuery } from './api';
import { useDraft } from './draftStore';
import type { SessionInput } from './types';

export function useVideosQuery(params: VideoQuery) {
  return useQuery({
    queryKey: ['videos', params],
    queryFn: () => api.videos(params),
    staleTime: 60_000,
  });
}

export function useJobsQuery() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.jobs(),
    staleTime: 10 * 60_000,
  });
}

export function useHeadsetsQuery() {
  return useQuery({
    queryKey: ['headsets'],
    queryFn: () => api.headsets(),
    staleTime: 10 * 60_000,
  });
}

export function useAudiencesQuery() {
  return useQuery({
    queryKey: ['audiences'],
    queryFn: () => api.audiences(),
    staleTime: 10 * 60_000,
  });
}

export function useSessionsQuery() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.sessions(),
    staleTime: 15_000,
  });
}

export function useSessionQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => api.session(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

// A session only stores video IDs — fetch each video to show titles/thumbnails.
export function useSessionVideosQuery(videoIds: string[] | undefined) {
  return useQuery({
    queryKey: ['session-videos', videoIds],
    queryFn: () => Promise.all((videoIds ?? []).map((id) => api.video(id))),
    enabled: !!videoIds && videoIds.length > 0,
    staleTime: 60_000,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  const clear = useDraft().clear;
  return useMutation({
    mutationFn: (input: SessionInput) => api.createSession(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      clear();
    },
  });
}
