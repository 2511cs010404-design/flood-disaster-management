export type RiskBand = "LOW" | "MODERATE" | "HIGH" | "VERY HIGH" | "EXTREME";
export type Severity = "green" | "yellow" | "orange" | "red";

export const LAST_UPDATED = "09:30 AM, today";
export const DATA_SOURCE = "Simulated weather feed (demo dataset)";

export const currentWeather = {
  city: "Hyderabad",
  district: "Hyderabad",
  state: "Telangana",
  temperature: 28,
  feelsLike: 31,
  condition: "Heavy Cloud & Rain",
  humidity: 82,
  wind: 12,
  windDirection: "SW",
  rainfall: 8,
  pressure: 1008,
  visibility: 3.2,
  cloudCover: 88,
  uvIndex: 3,
  dewPoint: 24,
  sunrise: "05:58",
  sunset: "18:42",
};

export const cities = [
  { name: "Hyderabad", temp: 28, rain: 8, condition: "Rain", severity: "red" as Severity },
  { name: "Warangal", temp: 30, rain: 4, condition: "Cloudy", severity: "orange" as Severity },
  { name: "Nizamabad", temp: 31, rain: 2, condition: "Cloudy", severity: "yellow" as Severity },
  { name: "Karimnagar", temp: 29, rain: 6, condition: "Showers", severity: "orange" as Severity },
  { name: "Khammam", temp: 32, rain: 1, condition: "Humid", severity: "yellow" as Severity },
  { name: "Adilabad", temp: 27, rain: 0, condition: "Clear", severity: "green" as Severity },
  { name: "Medak", temp: 28, rain: 3, condition: "Drizzle", severity: "yellow" as Severity },
  { name: "Mahbubnagar", temp: 33, rain: 0, condition: "Sunny", severity: "green" as Severity },
];

export const hourly = Array.from({ length: 24 }, (_, i) => {
  const hour = (9 + i) % 24;
  const rain = Math.max(0, Math.round(12 * Math.sin((i / 24) * Math.PI * 1.6) * 10) / 10);
  return {
    time: `${String(hour).padStart(2, "0")}:00`,
    temp: 26 + Math.round(5 * Math.cos((i / 24) * Math.PI * 2)),
    rainChance: Math.min(98, 35 + Math.round(rain * 5)),
    rainfall: rain,
    wind: 8 + (i % 7),
  };
});

export const daily = [
  { day: "Today", max: 30, min: 23, rain: 42, chance: 90, wind: 14, condition: "Very heavy rain" },
  { day: "Tue", max: 29, min: 23, rain: 28, chance: 80, wind: 12, condition: "Heavy rain" },
  { day: "Wed", max: 31, min: 24, rain: 12, chance: 60, wind: 10, condition: "Thundershowers" },
  { day: "Thu", max: 32, min: 24, rain: 6, chance: 45, wind: 9, condition: "Scattered rain" },
  { day: "Fri", max: 33, min: 25, rain: 2, chance: 30, wind: 8, condition: "Partly cloudy" },
  { day: "Sat", max: 33, min: 25, rain: 0, chance: 15, wind: 7, condition: "Sunny spells" },
  { day: "Sun", max: 32, min: 24, rain: 4, chance: 40, wind: 9, condition: "Light rain" },
];

export const rainfallWindows = [
  { label: "1 hr", value: 8 },
  { label: "3 hr", value: 26 },
  { label: "6 hr", value: 48 },
  { label: "12 hr", value: 74 },
  { label: "24 hr", value: 118 },
  { label: "7 days", value: 246 },
];

export const rainfallSeries = Array.from({ length: 12 }, (_, i) => ({
  time: `${String((i * 2 + 1) % 24).padStart(2, "0")}:00`,
  rainfall: Math.round(Math.abs(14 * Math.sin(i / 2.2)) * 10) / 10,
  intensity: Math.round(Math.abs(9 * Math.cos(i / 3)) * 10) / 10,
}));

export const districtRainfall = [
  { district: "Hyderabad", actual: 118, normal: 62, status: "Highly Excess" },
  { district: "Rangareddy", actual: 92, normal: 58, status: "Excess" },
  { district: "Medchal", actual: 84, normal: 60, status: "Excess" },
  { district: "Warangal", actual: 61, normal: 55, status: "Above Normal" },
  { district: "Karimnagar", actual: 48, normal: 52, status: "Normal" },
  { district: "Nizamabad", actual: 31, normal: 50, status: "Below Normal" },
  { district: "Khammam", actual: 44, normal: 49, status: "Normal" },
  { district: "Adilabad", actual: 18, normal: 47, status: "Below Normal" },
].map((d) => ({ ...d, departure: Math.round(((d.actual - d.normal) / d.normal) * 100) }));

export const rivers = [
  { name: "Musi", current: 4.8, warning: 5.0, danger: 6.0, flow: 1240, trend: "Rising" },
  { name: "Godavari", current: 9.1, warning: 11.0, danger: 13.0, flow: 8600, trend: "Steady" },
  { name: "Krishna", current: 7.4, warning: 8.5, danger: 10.0, flow: 6100, trend: "Rising" },
  { name: "Manjeera", current: 3.2, warning: 5.5, danger: 7.0, flow: 900, trend: "Falling" },
];

export const reservoirs = [
  { name: "Himayat Sagar", storage: 78, level: 533.1, capacity: 535.0, inflow: 4200, outflow: 1800 },
  { name: "Osman Sagar", storage: 71, level: 549.2, capacity: 551.0, inflow: 3100, outflow: 1200 },
  { name: "Nagarjuna Sagar", storage: 62, level: 578.4, capacity: 590.0, inflow: 22000, outflow: 15000 },
  { name: "Singur", storage: 88, level: 522.6, capacity: 523.6, inflow: 5600, outflow: 5200 },
];

export const warnings = [
  {
    id: "w1",
    severity: "red" as Severity,
    type: "Very Heavy Rainfall",
    location: "Hyderabad, Rangareddy, Medchal",
    issued: "Today 09:30 AM",
    validTill: "Today 09:00 PM",
    rainfall: "120 mm+ in 24 hours",
    impacts: ["Urban flooding in low-lying colonies", "Waterlogging on arterial roads", "Traffic disruption"],
    action: "Move away from low-lying areas and follow official instructions.",
    source: "Simulated warning feed (demo)",
  },
  {
    id: "w2",
    severity: "orange" as Severity,
    type: "Thunderstorm & Lightning",
    location: "Warangal, Karimnagar",
    issued: "Today 08:10 AM",
    validTill: "Today 06:00 PM",
    rainfall: "40–70 mm",
    impacts: ["Lightning strike risk in open fields", "Localised power interruption"],
    action: "Avoid open ground and take shelter in a pucca building.",
    source: "Simulated warning feed (demo)",
  },
  {
    id: "w3",
    severity: "yellow" as Severity,
    type: "Moderate Rain",
    location: "Khammam, Medak",
    issued: "Today 07:00 AM",
    validTill: "Tomorrow 06:00 AM",
    rainfall: "15–35 mm",
    impacts: ["Slippery roads", "Minor waterlogging"],
    action: "Be aware and plan travel with extra time.",
    source: "Simulated warning feed (demo)",
  },
];

export const nowcast = [
  { window: "0–1 hr", text: "Intense rain band moving in from the south-west.", level: "red" as Severity },
  { window: "1–3 hr", text: "Heavy rainfall with thunder likely to continue.", level: "orange" as Severity },
  { window: "3–6 hr", text: "Rain gradually easing to intermittent showers.", level: "yellow" as Severity },
];

export const shelters = [
  { name: "Govt. Higher Secondary School, Kukatpally", distance: 1.4, capacity: 400, available: 165, phone: "+91 40 2000 1122", address: "KPHB Phase 3, Kukatpally" },
  { name: "Community Hall, Ameerpet", distance: 3.1, capacity: 250, available: 82, phone: "+91 40 2000 3344", address: "Beside Metro Pillar 1076, Ameerpet" },
  { name: "Municipal Relief Camp, Serilingampally", distance: 5.6, capacity: 600, available: 410, phone: "+91 40 2000 5566", address: "Gachibowli Stadium Road" },
];

export const emergencyServices = [
  { name: "State Disaster Response Force", type: "Disaster Management", phone: "108" },
  { name: "Fire Control Room", type: "Fire Station", phone: "101" },
  { name: "Police Control Room", type: "Police", phone: "100" },
  { name: "Govt. General Hospital", type: "Hospital", phone: "+91 40 2460 1234" },
  { name: "GHMC Flood Helpline", type: "Municipal", phone: "040-21111111" },
];

export const citizenReports = [
  { id: "r1", location: "Kukatpally", depth: "1.5 ft", severity: "orange" as Severity, ago: "10 minutes ago", verified: true },
  { id: "r2", location: "Begumpet Underpass", depth: "3 ft", severity: "red" as Severity, ago: "22 minutes ago", verified: true },
  { id: "r3", location: "LB Nagar", depth: "0.5 ft", severity: "yellow" as Severity, ago: "48 minutes ago", verified: false },
];

export const floodRiskInputs = [
  { label: "Rainfall intensity (last 3 hr)", value: "26 mm", weight: 22 },
  { label: "Forecast rainfall (next 12 hr)", value: "85–120 mm", weight: 20 },
  { label: "River level (Musi)", value: "4.8 m / danger 6.0 m", weight: 14 },
  { label: "Reservoir storage", value: "78% average", weight: 10 },
  { label: "Ground saturation", value: "Saturated", weight: 8 },
  { label: "Drainage capacity", value: "Poor (urban)", weight: 4 },
];

export function riskBand(score: number): RiskBand {
  if (score <= 20) return "LOW";
  if (score <= 40) return "MODERATE";
  if (score <= 60) return "HIGH";
  if (score <= 80) return "VERY HIGH";
  return "EXTREME";
}

export function bandSeverity(band: RiskBand): Severity {
  if (band === "LOW") return "green";
  if (band === "MODERATE") return "yellow";
  if (band === "HIGH") return "orange";
  return "red";
}

export const FLOOD_RISK_SCORE = floodRiskInputs.reduce((a, b) => a + b.weight, 0);

export const historicalRainfall = [
  { year: "2019", rain: 812 },
  { year: "2020", rain: 1520 },
  { year: "2021", rain: 1105 },
  { year: "2022", rain: 1340 },
  { year: "2023", rain: 960 },
  { year: "2024", rain: 1188 },
  { year: "2025", rain: 1402 },
];

export const safetyTips = {
  before: [
    "Prepare an emergency kit with food, water and medicines",
    "Charge phones and power banks fully",
    "Store clean drinking water",
    "Move documents and valuables to a higher shelf",
    "Keep monitoring official alerts",
  ],
  during: [
    "Never walk or drive through moving water",
    "Avoid flooded roads and underpasses",
    "Move to higher ground when instructed",
    "Stay away from fallen electrical wires",
    "Follow instructions from authorities",
  ],
  after: [
    "Avoid contaminated flood water",
    "Do not enter damaged buildings",
    "Report fallen wires; do not touch them",
    "Boil drinking water before use",
    "Return home only after official clearance",
  ],
};

export const languages = {
  en: { alert: "Heavy Rain Alert", label: "English" },
  te: { alert: "భారీ వర్ష సూచన", label: "తెలుగు" },
  hi: { alert: "भारी वर्षा चेतावनी", label: "हिन्दी" },
};
