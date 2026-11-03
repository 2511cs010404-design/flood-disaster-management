// Demo-only auth: no backend, no real security. For the college demonstration.
export type DemoRole = "citizen" | "responder" | "admin";

export type DemoUser = {
  name: string;
  email: string;
  phone: string;
  district: string;
  role: DemoRole;
  signedInAt: string;
};

const KEY = "fg-demo-user";

export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("fg-auth"));
}

export function clearDemoUser() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("fg-auth"));
}

export const demoRoles: { value: DemoRole; label: string; hint: string }[] = [
  { value: "citizen", label: "Citizen", hint: "Alerts, shelters, report flooding" },
  { value: "responder", label: "Responder", hint: "Field teams & rescue coordination" },
  { value: "admin", label: "Control Room Admin", hint: "Publish warnings, verify reports" },
];
