import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, Moon, Sun, Volume2, Siren, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { languages } from "@/lib/floodguard-data";
import { clearDemoUser, getDemoUser, type DemoUser } from "@/lib/demo-auth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/forecast", label: "Weather" },
  { to: "/rainfall", label: "Rainfall" },
  { to: "/flood", label: "Flood" },
  { to: "/livemap", label: "Live Map" },
  { to: "/alerts", label: "Alerts" },
  { to: "/emergency", label: "Emergency" },
  { to: "/admin", label: "Admin" },
];

type Lang = keyof typeof languages;

export function AppShell({ children }: { children: ReactNode }) {
  const [light, setLight] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [online, setOnline] = useState(true);
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getDemoUser());
    sync();
    window.addEventListener("fg-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("fg-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("fg-theme");
    if (stored === "light") setLight(true);
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("fg-theme", light ? "light" : "dark");
  }, [light]);

  function speak() {
    const text = "Warning. Heavy rainfall is expected in your area. Avoid low lying roads.";
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  return (
    <div className="min-h-screen">
      {!online && (
        <div className="bg-warn/20 px-4 py-2 text-center text-sm text-warn">
          ⚠ Internet connection unavailable. Showing last available information — this data is not current.
        </div>
      )}
      <div className="alert-gradient px-4 py-2 text-center text-sm font-semibold text-danger-foreground">
        🚨 CRITICAL: Red alert for very heavy rainfall — Hyderabad, Rangareddy, Medchal.{" "}
        <Link to="/alerts" className="underline underline-offset-4">
          View details
        </Link>
      </div>

      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🌧
            </span>
            <span className="font-display text-lg font-bold tracking-tight">FLOODGUARD</span>
          </Link>

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="hidden rounded-md border border-input bg-surface-2 px-2 py-1.5 text-xs sm:block"
            >
              {Object.entries(languages).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="icon" aria-label="Listen to alert" onClick={speak}>
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
              onClick={() => setLight((v) => !v)}
            >
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button asChild variant="destructive" size="sm" className="animate-alert-pulse">
              <Link to="/emergency">
                <Siren className="mr-1 h-4 w-4" /> SOS
              </Link>
            </Button>

            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-xs leading-tight">
                  <span className="block font-semibold">{user.name}</span>
                  <span className="block capitalize text-muted-foreground">{user.role}</span>
                </span>
                <Button variant="ghost" size="icon" aria-label="Sign out" onClick={clearDemoUser}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">
                  <LogIn className="mr-1 h-4 w-4" /> Sign in
                </Link>
              </Button>
            )}



            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetTitle className="px-4 pt-4 font-display">FLOODGUARD</SheetTitle>
                <nav className="mt-4 flex flex-col gap-1 p-2">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <p className="sr-only">{languages[lang].alert}</p>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      <footer className="mt-16 border-t border-border bg-surface/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold">🌧 FLOODGUARD</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Early Warning. Quick Action. Safer Communities.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Explore</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                <Link to="/forecast">Forecast</Link>
              </li>
              <li>
                <Link to="/rainfall">Rainfall</Link>
              </li>
              <li>
                <Link to="/flood">Flood risk</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Support</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                <Link to="/emergency">Emergency</Link>
              </li>
              <li>
                <Link to="/alerts">Notifications</Link>
              </li>
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Disclaimer</p>
            <p className="mt-2">
              FloodGuard is an academic demonstration. Flood risk scores are system-generated estimates and are
              not official warnings. Always follow instructions from official authorities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
