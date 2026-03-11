/**
 * Fetches PurpleAir sensor data from our backend (which holds the API key).
 */

export interface PurpleAirSensor {
  name?: string;
  sensor_index?: number;
  "pm2.5_cf_1"?: number;
  pm2_5_cf_1?: number;
  "pm2.5_atm"?: number;
  last_seen?: number;
  temperature?: number;
  humidity?: number;
}

export interface PurpleAirResponse {
  sensors: PurpleAirSensor[];
}

function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (base) return base.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export async function fetchPurpleAirSensors(): Promise<PurpleAirSensor[]> {
  const base = getApiBase();
  const url = `${base}/api/purpleair`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.message || err.error || `PurpleAir ${res.status}`);
  }
  const data: PurpleAirResponse = await res.json();
  const list = data.sensors ?? [];
  return list.map((s) => ({
    ...s,
    pm2_5_cf_1: s["pm2.5_cf_1"] ?? s.pm2_5_cf_1,
  }));
}

/** PM2.5 to AQI (EPA scale) approximation. */
export function pm25ToAqi(pm25: number | undefined | null): number | null {
  if (pm25 == null || Number.isNaN(pm25)) return null;
  const pm = Number(pm25);
  if (pm <= 12) return Math.round((50 / 12) * pm);
  if (pm <= 35.4) return Math.round(50 + (50 / 23.4) * (pm - 12));
  if (pm <= 55.4) return Math.round(100 + (50 / 20) * (pm - 35.4));
  if (pm <= 150.4) return Math.round(150 + (100 / 95) * (pm - 55.4));
  if (pm <= 250.4) return Math.round(200 + (100 / 100) * (pm - 150.4));
  if (pm <= 500.4) return Math.round(300 + (200 / 250) * (pm - 250.4));
  return Math.min(500, Math.round(400 + (100 / 499) * (pm - 500.4)));
}

export function formatLastSeen(ts: number | undefined): string {
  if (ts == null) return "—";
  const d = new Date(ts * 1000);
  const now = Date.now();
  const diffMs = now - d.getTime();
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)} min ago`;
  if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)} hr ago`;
  return d.toLocaleString();
}
