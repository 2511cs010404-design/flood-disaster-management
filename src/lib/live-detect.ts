import type { Severity } from "@/lib/floodguard-data";

export type LiveConditions = {
  place: string;
  lat: number;
  lon: number;
  observedAt: string;
  temperature: number;
  apparent: number;
  humidity: number;
  pressure: number;
  wind: number;
  windGust: number;
  windDirection: number;
  rainNow: number;
  rain1h: number;
  rain6h: number;
  rain24h: number;
  rainNext6h: number;
  weatherCode: number;
  condition: string;
  cloudCover: number;
  visibility: number;
  floodScore: number;
  cycloneRisk: Severity;
  alerts: LiveAlert[];
};

export type LiveAlert = {
  id: string;
  severity: Severity;
  title: string;
  message: string;
};

const WMO: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm with hail",
};

export function windDirLabel(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8]!;
}

function sum(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) * 10) / 10;
}

export function computeFloodScore(o: {
  rain1h: number;
  rain6h: number;
  rain24h: number;
  rainNext6h: number;
  humidity: number;
}) {
  const s =
    Math.min(30, o.rain1h * 6) +
    Math.min(25, o.rain6h * 1.6) +
    Math.min(25, o.rain24h * 0.5) +
    Math.min(15, o.rainNext6h * 1.2) +
    Math.min(5, Math.max(0, (o.humidity - 70) / 6));
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function cycloneRisk(windGust: number, pressure: number): Severity {
  if (windGust >= 90 || pressure <= 985) return "red";
  if (windGust >= 62 || pressure <= 995) return "orange";
  if (windGust >= 40 || pressure <= 1002) return "yellow";
  return "green";
}

function buildAlerts(c: Omit<LiveConditions, "alerts">): LiveAlert[] {
  const out: LiveAlert[] = [];
  if (c.rain1h >= 15 || c.rainNow >= 7)
    out.push({
      id: "rain",
      severity: c.rain1h >= 30 ? "red" : "orange",
      title: "Heavy rainfall detected",
      message: `${c.rain1h} mm recorded in the last hour at ${c.place}. Avoid underpasses and low-lying roads.`,
    });
  else if (c.rain1h >= 5)
    out.push({
      id: "rain",
      severity: "yellow",
      title: "Moderate rain in your area",
      message: `${c.rain1h} mm in the last hour at ${c.place}. Waterlogging possible on local roads.`,
    });

  if (c.floodScore >= 70)
    out.push({
      id: "flood",
      severity: "red",
      title: "Very high flood risk",
      message: `Live flood risk score ${c.floodScore}/100 near ${c.place}. Move valuables to higher ground and be ready to evacuate.`,
    });
  else if (c.floodScore >= 45)
    out.push({
      id: "flood",
      severity: "orange",
      title: "Elevated flood risk",
      message: `Live flood risk score ${c.floodScore}/100 near ${c.place}. Monitor updates and avoid flooded streets.`,
    });

  if (c.cycloneRisk === "red" || c.cycloneRisk === "orange")
    out.push({
      id: "cyclone",
      severity: c.cycloneRisk,
      title: c.cycloneRisk === "red" ? "Cyclonic storm conditions" : "Strong gale / cyclone watch",
      message: `Gusts up to ${c.windGust} km/h with pressure ${c.pressure} hPa. Secure loose objects and stay indoors.`,
    });

  if (c.weatherCode >= 95)
    out.push({
      id: "storm",
      severity: "orange",
      title: "Thunderstorm detected",
      message: `${c.condition} over ${c.place}. Stay away from trees, poles and open ground.`,
    });

  if (out.length === 0)
    out.push({
      id: "ok",
      severity: "green",
      title: "No hazardous weather detected",
      message: `Conditions are normal at ${c.place}. Live monitoring continues automatically.`,
    });
  return out;
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    const j = (await res.json()) as { city?: string; locality?: string; principalSubdivision?: string };
    const city = j.city || j.locality;
    return [city, j.principalSubdivision].filter(Boolean).join(", ") || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
  } catch {
    return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
  }
}

export async function fetchLiveConditions(lat: number, lon: number, place?: string): Promise<LiveConditions> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility` +
    `&hourly=precipitation,precipitation_probability` +
    `&past_hours=24&forecast_hours=6&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather feed error ${res.status}`);
  const j = (await res.json()) as {
    current: Record<string, number | string>;
    hourly: { time: string[]; precipitation: number[] };
  };
  const cur = j.current;
  const now = String(cur["time"]);
  const times = j.hourly.time;
  const precip = j.hourly.precipitation ?? [];
  const idx = Math.max(0, times.findIndex((t) => t >= now));
  const past = precip.slice(0, idx);
  const future = precip.slice(idx);

  const rain1h = sum(past.slice(-1));
  const rain6h = sum(past.slice(-6));
  const rain24h = sum(past.slice(-24));
  const rainNext6h = sum(future.slice(0, 6));

  const humidity = Number(cur["relative_humidity_2m"] ?? 0);
  const pressure = Math.round(Number(cur["pressure_msl"] ?? cur["surface_pressure"] ?? 1010));
  const windGust = Math.round(Number(cur["wind_gusts_10m"] ?? 0));
  const code = Number(cur["weather_code"] ?? 0);

  const base = {
    place: place ?? (await reverseGeocode(lat, lon)),
    lat,
    lon,
    observedAt: now,
    temperature: Math.round(Number(cur["temperature_2m"] ?? 0)),
    apparent: Math.round(Number(cur["apparent_temperature"] ?? 0)),
    humidity,
    pressure,
    wind: Math.round(Number(cur["wind_speed_10m"] ?? 0)),
    windGust,
    windDirection: Math.round(Number(cur["wind_direction_10m"] ?? 0)),
    rainNow: Math.round(Number(cur["precipitation"] ?? 0) * 10) / 10,
    rain1h,
    rain6h,
    rain24h,
    rainNext6h,
    weatherCode: code,
    condition: WMO[code] ?? "Unknown",
    cloudCover: Math.round(Number(cur["cloud_cover"] ?? 0)),
    visibility: Math.round((Number(cur["visibility"] ?? 0) / 1000) * 10) / 10,
    floodScore: computeFloodScore({ rain1h, rain6h, rain24h, rainNext6h, humidity }),
    cycloneRisk: cycloneRisk(windGust, pressure),
  };

  return { ...base, alerts: buildAlerts(base) };
}
