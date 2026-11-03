import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SeverityBadge } from "@/components/floodguard/severity";
import { RiskGauge } from "@/components/floodguard/RiskGauge";
import { fetchLiveConditions, reverseGeocode, windDirLabel, type LiveConditions } from "@/lib/live-detect";
import { MapPin, RefreshCw, BellRing, Clock, Wind, Droplets, Gauge, CloudRain } from "lucide-react";

const FALLBACK = { lat: 17.385, lon: 78.4867, place: "Hyderabad, Telangana" };
const REFRESH_MS = 5 * 60 * 1000;

export function LiveDetect({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<LiveConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [notifyOn, setNotifyOn] = useState(false);
  const coordsRef = useRef<{ lat: number; lon: number; place?: string }>(FALLBACK);
  const notifiedRef = useRef<Record<string, string>>({});

  // live clock
  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { lat, lon, place } = coordsRef.current;
      const next = await fetchLiveConditions(lat, lon, place);
      setData(next);
      setError(null);
      setLastSync(new Date());
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Live feed unavailable");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // auto-detect location once, then poll
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lon = pos.coords.longitude;
              coordsRef.current = { lat, lon, place: await reverseGeocode(lat, lon) };
              resolve();
            },
            () => resolve(),
            { timeout: 8000 },
          );
        });
      }
      if (!cancelled) void load();
    }
    void start();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [load]);

  // push notifications for new hazardous alerts
  useEffect(() => {
    if (!notifyOn || !data) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    data.alerts
      .filter((a) => a.severity !== "green")
      .forEach((a) => {
        const sig = `${a.severity}:${a.title}`;
        if (notifiedRef.current[a.id] === sig) return;
        notifiedRef.current[a.id] = sig;
        new Notification(`🚨 FLOODGUARD — ${a.title}`, { body: a.message });
        toast.warning(a.title, { description: a.message });
      });
  }, [data, notifyOn]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported on this device.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      toast("Notifications not enabled.");
      return;
    }
    setNotifyOn(true);
    notifiedRef.current = {};
    toast.success("Live hazard notifications enabled for your location.");
  }

  function detectAgain() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }
    toast("Detecting your location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        coordsRef.current = { lat, lon, place: await reverseGeocode(lat, lon) };
        const next = await load();
        if (next) toast.success(`Live detection updated for ${next.place}`);
      },
      () => toast.error("Location permission denied — showing Hyderabad region."),
    );
  }

  const worst = data?.alerts.reduce(
    (acc, a) => (rank(a.severity) > rank(acc) ? a.severity : acc),
    "green" as LiveConditions["cycloneRisk"],
  );

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
            </span>
            Real-time detection — your location
          </CardTitle>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {data?.place ?? "Locating…"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {clock}
            </span>
            <span>
              Synced {lastSync ? lastSync.toLocaleTimeString() : "—"} · auto-refresh every 5 min · Open-Meteo live feed
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={detectAgain}>
            <MapPin className="mr-1 h-4 w-4" /> Detect my location
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Update now
          </Button>
          <Button size="sm" onClick={enableNotifications} disabled={notifyOn}>
            <BellRing className="mr-1 h-4 w-4" /> {notifyOn ? "Alerts on" : "Enable live alerts"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <p className="rounded-lg border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
            Live feed problem: {error}. Retrying automatically.
          </p>
        )}
        {!data && !error && <p className="text-sm text-muted-foreground">Detecting live weather around you…</p>}

        {data && (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="font-display text-5xl font-bold">{data.temperature}°C</p>
                    <p className="text-primary">{data.condition}</p>
                    <p className="text-sm text-muted-foreground">Feels like {data.apparent}°C</p>
                    {worst && <div className="mt-3"><SeverityBadge severity={worst} /></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <Stat icon={<CloudRain className="h-4 w-4" />} label="Rain now" value={`${data.rainNow} mm`} />
                    <Stat icon={<Droplets className="h-4 w-4" />} label="Last 1 h" value={`${data.rain1h} mm`} />
                    <Stat icon={<Droplets className="h-4 w-4" />} label="Last 6 h" value={`${data.rain6h} mm`} />
                    <Stat icon={<Droplets className="h-4 w-4" />} label="Last 24 h" value={`${data.rain24h} mm`} />
                    <Stat icon={<CloudRain className="h-4 w-4" />} label="Next 6 h" value={`${data.rainNext6h} mm`} />
                    <Stat
                      icon={<Wind className="h-4 w-4" />}
                      label="Wind / gust"
                      value={`${data.wind} / ${data.windGust} km/h ${windDirLabel(data.windDirection)}`}
                    />
                    <Stat icon={<Gauge className="h-4 w-4" />} label="Pressure" value={`${data.pressure} hPa`} />
                    <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${data.humidity}%`} />
                    <Stat icon={<Wind className="h-4 w-4" />} label="Cyclone watch" value={data.cycloneRisk.toUpperCase()} />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Live flood risk from detected rainfall</span>
                    <span className="font-semibold text-foreground">{data.floodScore}/100</span>
                  </div>
                  <Progress value={data.floodScore} className="h-2" />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <RiskGauge score={data.floodScore} />
              </div>
            </div>

            {!compact && (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.alerts.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-surface-2/50 p-4">
                    <SeverityBadge severity={a.severity}>{a.title}</SeverityBadge>
                    <p className="mt-2 text-sm text-muted-foreground">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function rank(s: string) {
  return { green: 0, yellow: 1, orange: 2, red: 3 }[s] ?? 0;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
