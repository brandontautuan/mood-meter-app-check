import { useState, useEffect } from "react";
import {
  fetchPurpleAirSensors,
  pm25ToAqi,
  formatLastSeen,
  type PurpleAirSensor,
} from "../services/purpleair";

function AqiBadge({ aqi }: { aqi: number | null }) {
  if (aqi == null) return <span className="text-muted-foreground">—</span>;
  const level =
    aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : aqi <= 150 ? "Unhealthy (sensitive)" : "Unhealthy";
  const color =
    aqi <= 50 ? "bg-green-500" : aqi <= 100 ? "bg-yellow-500" : aqi <= 150 ? "bg-orange-500" : "bg-red-500";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white ${color}`}>
      AQI {aqi} · {level}
    </span>
  );
}

function SensorCard({ sensor }: { sensor: PurpleAirSensor }) {
  const pm25 = sensor["pm2.5_cf_1"] ?? sensor.pm2_5_cf_1;
  const aqi = pm25ToAqi(pm25);
  const name = sensor.name || `Sensor ${sensor.sensor_index ?? "?"}`;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">PM2.5 (CF 1)</span>
          <span className="font-mono font-medium">{pm25 != null ? pm25.toFixed(1) : "—"} µg/m³</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">AQI</span>
          <AqiBadge aqi={aqi} />
        </div>
        {sensor.temperature != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-mono">{sensor.temperature.toFixed(1)} °F</span>
          </div>
        )}
        {sensor.humidity != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Humidity</span>
            <span className="font-mono">{sensor.humidity.toFixed(0)}%</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated</span>
          <span>{formatLastSeen(sensor.last_seen)}</span>
        </div>
      </div>
    </div>
  );
}

export function AirQualityPanel() {
  const [sensors, setSensors] = useState<PurpleAirSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPurpleAirSensors();
        if (!cancelled) setSensors(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load air quality");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Loading air quality data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <p className="font-medium">Could not load PurpleAir data</p>
        <p className="mt-1 text-sm">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ensure the backend is running and PURPLEAIR_READ_KEY is set. See DEPLOYMENT.md for setup.
        </p>
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No PurpleAir sensors found. Set PURPLEAIR_SENSOR_IDS or PURPLEAIR_NAME_FILTER on the server.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Real-time air quality from PurpleAir sensors (Innovation Center).
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {sensors.map((s) => (
          <SensorCard key={s.sensor_index ?? s.name ?? Math.random()} sensor={s} />
        ))}
      </div>
    </div>
  );
}
