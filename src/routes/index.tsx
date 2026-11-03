import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Cloud,
  Thermometer,
  MapPin,
  Sunrise,
  Sunset,
  Play,
} from "lucide-react";
import { AppShell } from "@/components/floodguard/AppShell";
import { LiveDetect } from "@/components/floodguard/LiveDetect";
import { SeverityBadge } from "@/components/floodguard/severity";
import { RiskGauge } from "@/components/floodguard/RiskGauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  currentWeather,
  cities,
  rainfallWindows,
  warnings,
  nowcast,
  FLOOD_RISK_SCORE,
  riskBand,
  bandSeverity,
  DATA_SOURCE,
  LAST_UPDATED,
} from "@/lib/floodguard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FloodGuard — Real-Time Rain & Flood Early Warning" },
      {
        name: "description",
        content:
          "FloodGuard monitors rainfall, weather, river levels and flood risk, and delivers early warnings, shelters and evacuation guidance.",
      },
      { property: "og:title", content: "FloodGuard — Flood & Rainfall Early Warning System" },
      {
        property: "og:description",
        content: "Live weather, rainfall monitoring, flood risk scoring and emergency response in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const DEMO_STEPS = [
  { icon: "🌧", label: "Heavy rain recorded — 26 mm in 3 hours" },
  { icon: "🌊", label: "Musi river level rising — 4.8 m of 6.0 m danger mark" },
  { icon: "⚠", label: "Flood risk recalculated — 78% VERY HIGH" },
  { icon: "🚨", label: "FLOOD ALERT dispatched to subscribed residents" },
];

function Dashboard() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(`${currentWeather.city}, ${currentWeather.state}`);
  const [demoStep, setDemoStep] = useState(-1);
  const score = FLOOD_RISK_SCORE;
  const band = riskBand(score);

  useEffect(() => {
    if (demoStep < 0 || demoStep >= DEMO_STEPS.length - 1) return;
    const t = setTimeout(() => setDemoStep((s) => s + 1), 1200);
    return () => clearTimeout(t);
  }, [demoStep]);

  function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }
    toast("Allow FloodGuard to access your location?");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`Lat ${pos.coords.latitude.toFixed(3)}, Lon ${pos.coords.longitude.toFixed(3)}`);
        toast.success("Location detected — showing local weather and flood alerts.");
      },
      () => toast.error("Location permission denied. Select your district manually."),
    );
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported here.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("🚨 FLOODGUARD ALERT", {
        body: "Heavy rainfall expected in your area. Avoid low-lying roads and follow official instructions.",
      });
      toast.success("Emergency weather notifications enabled.");
    } else toast("Notifications not enabled.");
  }

  const filtered = cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell>
      <section className="animate-rise">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-widest text-primary uppercase">Current location</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold sm:text-4xl">
              <MapPin className="h-7 w-7 text-primary" /> {location}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Source: {DATA_SOURCE} · Updated: {LAST_UPDATED} · Type: Observation + Forecast
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={detectLocation}>Detect my location</Button>
            <Button variant="secondary" onClick={enableNotifications}>
              Enable alerts
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDemoStep(0);
                toast("Demo flood alert workflow started");
              }}
            >
              <Play className="mr-1 h-4 w-4" /> Demo flood alert
            </Button>
          </div>
        </div>

        {demoStep >= 0 && (
          <Card className="mt-6 border-danger/40 glass">
            <CardHeader>
              <CardTitle className="text-danger">Demo mode — simulated alert workflow</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              {DEMO_STEPS.map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-lg border p-3 text-sm transition-opacity ${
                    i <= demoStep ? "border-danger/50 bg-danger/10 opacity-100" : "opacity-35"
                  }`}
                >
                  <span className="text-xl" aria-hidden>
                    {s.icon}
                  </span>
                  <p className="mt-1">{s.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-8">
        <LiveDetect />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden glass lg:col-span-2">
          <div className="pointer-events-none absolute inset-0 rain-layer opacity-30" aria-hidden />
          <CardContent className="relative p-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">{currentWeather.city} · Current weather</p>
                <p className="mt-2 font-display text-7xl font-bold">{currentWeather.temperature}°C</p>
                <p className="mt-1 text-lg text-primary">{currentWeather.condition}</p>
                <p className="text-sm text-muted-foreground">
                  Feels like {currentWeather.feelsLike}°C · Dew point {currentWeather.dewPoint}°C · UV{" "}
                  {currentWeather.uvIndex}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Metric icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${currentWeather.humidity}%`} />
                <Metric icon={<Wind className="h-4 w-4" />} label="Wind" value={`${currentWeather.wind} km/h ${currentWeather.windDirection}`} />
                <Metric icon={<Droplets className="h-4 w-4" />} label="Rainfall" value={`${currentWeather.rainfall} mm`} />
                <Metric icon={<Gauge className="h-4 w-4" />} label="Pressure" value={`${currentWeather.pressure} hPa`} />
                <Metric icon={<Eye className="h-4 w-4" />} label="Visibility" value={`${currentWeather.visibility} km`} />
                <Metric icon={<Cloud className="h-4 w-4" />} label="Cloud cover" value={`${currentWeather.cloudCover}%`} />
                <Metric icon={<Sunrise className="h-4 w-4" />} label="Sunrise" value={currentWeather.sunrise} />
                <Metric icon={<Sunset className="h-4 w-4" />} label="Sunset" value={currentWeather.sunset} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Flood risk estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskGauge score={score} />
            <div className="mt-4 space-y-2 text-sm">
              <SeverityBadge severity={bandSeverity(band)}>{band}</SeverityBadge>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Heavy rainfall in last 6 hours</li>
                <li>Rising river level</li>
                <li>Saturated ground</li>
                <li>Low-lying urban drainage</li>
              </ul>
              <p className="pt-2 text-xs text-warn">
                System-generated risk estimate — not an official warning.
              </p>
              <Button asChild variant="secondary" className="mt-2 w-full">
                <Link to="/flood">Open flood risk engine</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Active warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warnings.map((w) => (
              <div key={w.id} className="rounded-lg border border-border bg-surface-2/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SeverityBadge severity={w.severity} />
                  <span className="text-xs text-muted-foreground">Issued {w.issued}</span>
                </div>
                <p className="mt-2 font-semibold">{w.type}</p>
                <p className="text-sm text-muted-foreground">
                  {w.location} · Expected rainfall {w.rainfall}
                </p>
                <p className="mt-2 text-sm">{w.action}</p>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/alerts">All warnings & notifications</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Nowcast (next 6 hours)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nowcast.map((n) => (
                <div key={n.window} className="rounded-lg border border-border p-3">
                  <SeverityBadge severity={n.level}>{n.window}</SeverityBadge>
                  <p className="mt-2 text-sm text-muted-foreground">{n.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Rainfall accumulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rainfallWindows.map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-semibold">{r.value} mm</span>
                  </div>
                  <Progress value={Math.min(100, (r.value / 250) * 100)} className="mt-1 h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Major city weather</h2>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, district or village"
            className="max-w-xs"
            aria-label="Search city"
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((c) => (
            <Card key={c.name} className="glass transition-transform hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.name}</p>
                  <SeverityBadge severity={c.severity}>{c.severity.toUpperCase()}</SeverityBadge>
                </div>
                <p className="mt-3 flex items-center gap-2 text-3xl font-bold">
                  <Thermometer className="h-5 w-5 text-primary" />
                  {c.temp}°C
                </p>
                <p className="text-sm text-muted-foreground">
                  {c.condition} · {c.rain} mm rain
                </p>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground">No matching location.</p>}
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </span>
    </div>
  );
}
