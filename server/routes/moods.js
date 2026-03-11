// server/routes/moods.js
// Same API your frontends use; data stored in Supabase.
import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

async function readMoods() {
  const { data, error } = await supabase
    .from('moods')
    .select(`
      id, client_timestamp, created_at, date_only,
      l1_id, l1_label, l2_id, l2_label, time_to_select_ms
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    timestamp: r.client_timestamp ?? r.created_at,
    dateOnly: r.date_only,
    l1: { id: r.l1_id, label: r.l1_label },
    l2: { id: r.l2_id, label: r.l2_label },
    timeToSelectMs: r.time_to_select_ms,
  }));
}

async function insertMood(entry) {
  if (!entry || !entry.timestamp || !entry.l1 || !entry.l2) {
    throw new Error('Invalid mood entry');
  }

  const { timestamp, dateOnly, l1, l2, timeToSelectMs, kioskId } = entry;

  const row = {
    kiosk_id: kioskId ?? null,
    client_timestamp: new Date(timestamp).toISOString(),
    date_only: dateOnly ?? null,
    l1_id: l1.id,
    l1_label: l1.label,
    l2_id: l2.id,
    l2_label: l2.label,
    time_to_select_ms: timeToSelectMs ?? null,
  };

  const { error } = await supabase.from('moods').insert(row);
  if (error) throw error;
}

router.get('/', async (_req, res) => {
  try {
    const moods = await readMoods();
    res.json(moods);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'read_failed' });
  }
});

router.post('/', async (req, res) => {
  const entry = req.body;

  if (!entry) return res.status(400).json({ error: 'missing_body' });
  if (!('timestamp' in entry)) return res.status(400).json({ error: 'missing_timestamp' });
  if (!('l1' in entry)) return res.status(400).json({ error: 'missing_l1' });
  if (!('l2' in entry)) return res.status(400).json({ error: 'missing_l2' });

  try {
    await insertMood(entry);
    return res.status(201).json({ success: true });
  } catch (e) {
    console.error('insert_failed:', e);
    return res.status(500).json({ error: 'db_insert_failed', details: String(e?.message ?? e) });
  }
});

export default router;
