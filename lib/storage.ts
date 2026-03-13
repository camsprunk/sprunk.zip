import type { AppState } from './types';

const STORAGE_KEY = 'griid_v1';

const DEFAULT_STATE: AppState = {
  tiles: [],
  folders: [],
};

/** Sync read from localStorage — used inside state-update callbacks. */
export function loadState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw) as AppState;
  } catch {
    return DEFAULT_STATE;
  }
}

/**
 * Async load on mount — fetches from the DB, falls back to localStorage.
 * Also primes localStorage so sync reads stay consistent.
 */
export async function fetchState(): Promise<AppState> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('fetch failed');
    const state = await res.json() as AppState;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return state;
  } catch {
    return loadState();
  }
}

/**
 * Write to localStorage immediately (keeps UI instant), then persist to DB
 * in the background.
 */
export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage quota exceeded', e);
  }
  fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch(err => console.warn('Failed to persist state to DB', err));
}
