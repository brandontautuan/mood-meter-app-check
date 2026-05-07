/**
 * API service for Mood Meter App (kiosk)
 * Sends mood entries to the backend server, which writes to Supabase.
 * Also supports direct Supabase submission when VITE_SUPABASE_URL/ANON_KEY are set.
 */

import { SupabaseApiService } from './supabaseApi';

// Server base URL — can be overridden with Vite env (VITE_API_BASE_URL)
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:4001';

// Direct Supabase submission is on when both env vars are configured
const USE_SUPABASE =
  !!(import.meta as any).env?.VITE_SUPABASE_URL &&
  !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

/** Payload the server expects at POST /api/moods */
export interface SubmitMoodPayload {
  timestamp: string;                 // ISO string
  dateOnly: string;                  // YYYY-MM-DD
  l1: { id: string; label: string };
  l2: { id: string; label: string };
  timeToSelectMs?: number;           // optional
  kioskId?: string;                  // optional
}

/**
 * Submit a mood entry. Goes directly to Supabase if configured,
 * otherwise POSTs to the backend server (which writes to Supabase).
 * On failure we stash a backup in localStorage so it can be re-sent later.
 */
export async function submitMoodEntry(entry: SubmitMoodPayload): Promise<void> {
  try {
    if (USE_SUPABASE) {
      const result = await SupabaseApiService.submitMoodEntry(entry);
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit to Supabase');
      }
      console.log('Mood entry submitted to Supabase:', result.data);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/moods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Failed to submit mood entry: ${res.status} ${JSON.stringify(err)}`
      );
    }

    const data = await res.json().catch(() => ({}));
    console.log('Mood entry submitted successfully:', data);
  } catch (error) {
    console.error('Error submitting mood entry:', error);
    saveToLocalStorage(entry);
    throw error;
  }
}

/** Local backup if the POST fails (helps you re-send later) */
function saveToLocalStorage(entry: SubmitMoodPayload): void {
  try {
    const existing = localStorage.getItem('mood_entries_backup') || '[]';
    const entries = JSON.parse(existing);
    entries.push(entry);
    localStorage.setItem('mood_entries_backup', JSON.stringify(entries));
    console.log('Mood entry saved to localStorage as backup');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/** Optional quick health check for your server from the kiosk */
export async function pingServer(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
