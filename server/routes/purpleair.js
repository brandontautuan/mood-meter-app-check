/**
 * PurpleAir API proxy – keeps the API READ key on the server.
 * GET /api/purpleair – returns sensors matching PURPLEAIR_SENSOR_IDS or name filter.
 *
 * Env:
 *   PURPLEAIR_READ_KEY  – required; your PurpleAir API READ key
 *   PURPLEAIR_SENSOR_IDS – optional; comma-separated sensor indexes (e.g. "12345,67890")
 *   PURPLEAIR_NAME_FILTER – optional; filter list by name containing this (e.g. "InnovationCenterPurple")
 *
 * If PURPLEAIR_SENSOR_IDS is set we fetch those sensors. Otherwise we use the
 * list endpoint and filter by PURPLEAIR_NAME_FILTER (default "InnovationCenterPurple").
 */
import express from 'express';

const router = express.Router();
const PURPLEAIR_BASE = 'https://api.purpleair.com/v1';

const FIELDS = 'name,sensor_index,pm2.5_cf_1,pm2.5_atm,last_seen,temperature,humidity';

/**
 * Fetch one sensor by index.
 */
async function fetchSensor(apiKey, sensorIndex) {
  const url = `${PURPLEAIR_BASE}/sensors/${sensorIndex}?fields=${FIELDS}`;
  const res = await fetch(url, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PurpleAir ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data?.sensor != null ? data.sensor : data;
}

/**
 * List sensors (optional bounds). Returns { data: [ [field0, field1, ...], ... ], fields: [...] }.
 */
async function listSensors(apiKey, fields = FIELDS) {
  const url = `${PURPLEAIR_BASE}/sensors?fields=${fields}`;
  const res = await fetch(url, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PurpleAir list ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Parse list response into array of objects keyed by field names.
 */
function parseListResponse(listData) {
  const { data, fields } = listData;
  if (!Array.isArray(fields) || !Array.isArray(data)) return [];
  return data.map((row) => {
    const obj = {};
    fields.forEach((f, i) => { obj[f] = row[i]; });
    return obj;
  });
}

router.get('/', async (_req, res) => {
  const apiKey = process.env.PURPLEAIR_READ_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'PurpleAir not configured',
      hint: 'Set PURPLEAIR_READ_KEY (and optionally PURPLEAIR_SENSOR_IDS or PURPLEAIR_NAME_FILTER) on the server.',
    });
  }

  try {
    const sensorIdsEnv = process.env.PURPLEAIR_SENSOR_IDS;
    const nameFilter = process.env.PURPLEAIR_NAME_FILTER || 'InnovationCenterPurple';

    let sensors = [];

    if (sensorIdsEnv && String(sensorIdsEnv).trim()) {
      const ids = String(sensorIdsEnv).split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
      for (const id of ids) {
        try {
          const sensor = await fetchSensor(apiKey, id);
          if (sensor && (sensor.name != null || sensor.sensor_index != null)) sensors.push(sensor);
        } catch (e) {
          console.warn(`PurpleAir sensor ${id}:`, e.message);
        }
      }
    } else {
      const listData = await listSensors(apiKey);
      const all = parseListResponse(listData);
      sensors = all.filter((s) => (s.name || '').includes(nameFilter));
    }

    res.json({ sensors });
  } catch (e) {
    console.error('PurpleAir proxy error:', e);
    res.status(502).json({ error: 'Failed to fetch PurpleAir data', message: e.message });
  }
});

export default router;
