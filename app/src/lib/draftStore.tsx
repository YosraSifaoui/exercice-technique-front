// Session draft: the videos picked for the next séance, with a name and headset.
// Saved to localStorage so a refresh on a tablet doesn't lose the work.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Headset } from './types';

export interface DraftItem {
  id: string;
  title: string;
  duration_seconds: number;
  thumbnail_url: string | null;
}

export interface SessionDraft {
  name: string;
  items: DraftItem[];
  headset_id: string | null;
}

interface DraftContextValue extends SessionDraft {
  totalDuration: number;
  setName: (name: string) => void;
  add: (item: DraftItem) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
  rename: (id: string, title: string) => void;
  setHeadset: (id: string | null) => void;
  clear: () => void;
}

const STORAGE_KEY = 'm360.session-draft.v1';
const EMPTY: SessionDraft = { name: '', items: [], headset_id: null };

function load(): SessionDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      headset_id: parsed.headset_id ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function swap(items: DraftItem[], id: string, dir: -1 | 1): DraftItem[] {
  const index = items.findIndex((i) => i.id === id);
  const target = index + dir;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  const tmp = next[index]!;
  next[index] = next[target]!;
  next[target] = tmp;
  return next;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SessionDraft>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const value: DraftContextValue = {
    ...draft,
    totalDuration: draft.items.reduce((sum, item) => sum + item.duration_seconds, 0),
    setName: (name) => setDraft((d) => ({ ...d, name })),
    add: (item) =>
      setDraft((d) => (d.items.some((i) => i.id === item.id) ? d : { ...d, items: [...d.items, item] })),
    remove: (id) => setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })),
    move: (id, dir) => setDraft((d) => ({ ...d, items: swap(d.items, id, dir) })),
    rename: (id, title) =>
      setDraft((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, title } : i)) })),
    setHeadset: (headset_id) => setDraft((d) => ({ ...d, headset_id })),
    clear: () => setDraft(EMPTY),
  };

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used within a DraftProvider');
  return ctx;
}

// Validation mirroring POST /sessions rules.
export function validateDraft(draft: SessionDraft, headsets: Headset[]) {
  const errors: { field: 'name' | 'video_ids' | 'headset_id'; message: string }[] = [];
  const name = draft.name.trim();
  if (!name) errors.push({ field: 'name', message: 'Le nom de la séance est obligatoire.' });
  else if (name.length > 120) errors.push({ field: 'name', message: 'Le nom ne doit pas dépasser 120 caractères.' });
  if (draft.items.length === 0) errors.push({ field: 'video_ids', message: 'Sélectionnez au moins une vidéo.' });
  else if (draft.items.length > 30) errors.push({ field: 'video_ids', message: 'Une séance contient au plus 30 vidéos.' });
  if (draft.headset_id && !headsets.some((h) => h.id === draft.headset_id)) {
    errors.push({ field: 'headset_id', message: 'Modèle de casque inconnu.' });
  }
  return errors;
}
