// Browser-safe geo data for the live maps (no leaflet imports here).

export type LatLng = [number, number];

export const MAP_CENTER: LatLng = [17.385, 78.4867]; // Hyderabad

export type MapPoint = {
  id: string;
  name: string;
  detail: string;
  position: LatLng;
};

export const floodZones: (MapPoint & { severity: "red" | "orange" | "yellow"; radius: number; depth: string })[] = [
  { id: "z1", name: "Begumpet Underpass", detail: "Road closed — deep waterlogging", severity: "red", radius: 900, depth: "3 ft", position: [17.4435, 78.4645] },
  { id: "z2", name: "Kukatpally / KPHB", detail: "Colony roads flooded", severity: "orange", radius: 1400, depth: "1.5 ft", position: [17.4849, 78.4138] },
  { id: "z3", name: "LB Nagar", detail: "Minor waterlogging at junction", severity: "yellow", radius: 1100, depth: "0.5 ft", position: [17.3457, 78.5522] },
  { id: "z4", name: "Musi river bank, Chaderghat", detail: "River nearing warning level", severity: "orange", radius: 1200, depth: "2 ft", position: [17.3697, 78.4869] },
  { id: "z5", name: "Hafeezpet", detail: "Nala overflow reported", severity: "red", radius: 800, depth: "2.5 ft", position: [17.4809, 78.3552] },
];

export const shelterPoints: MapPoint[] = [
  { id: "s1", name: "Govt. Higher Secondary School, Kukatpally", detail: "165 of 400 beds free · +91 40 2000 1122", position: [17.4948, 78.3996] },
  { id: "s2", name: "Community Hall, Ameerpet", detail: "82 of 250 beds free · +91 40 2000 3344", position: [17.4374, 78.4487] },
  { id: "s3", name: "Municipal Relief Camp, Serilingampally", detail: "410 of 600 beds free · +91 40 2000 5566", position: [17.4479, 78.3498] },
];

export const hospitalPoints: MapPoint[] = [
  { id: "h1", name: "Govt. General Hospital, Osmania", detail: "24x7 emergency · +91 40 2460 1234", position: [17.3714, 78.4741] },
  { id: "h2", name: "Gandhi Hospital, Secunderabad", detail: "24x7 trauma care", position: [17.4438, 78.5005] },
];

export const responderPoints: MapPoint[] = [
  { id: "p1", name: "Police Control Room", detail: "Dial 100", position: [17.3853, 78.4867] },
  { id: "p2", name: "Fire Station, Gandhinagar", detail: "Dial 101", position: [17.4093, 78.4823] },
  { id: "p3", name: "SDRF Team, Hakimpet", detail: "Dial 108 · rescue boats deployed", position: [17.5453, 78.5074] },
];

export const riverPoints: MapPoint[] = [
  { id: "rv1", name: "Musi — Chaderghat gauge", detail: "4.8 m · warning 5.0 m · danger 6.0 m · Rising", position: [17.3697, 78.4869] },
  { id: "rv2", name: "Manjeera — Sangareddy gauge", detail: "3.2 m · warning 5.5 m · Falling", position: [17.6252, 78.0873] },
];

export const damPoints: MapPoint[] = [
  { id: "d1", name: "Himayat Sagar", detail: "78% storage · inflow 4200 cusecs", position: [17.3384, 78.3335] },
  { id: "d2", name: "Osman Sagar (Gandipet)", detail: "71% storage · inflow 3100 cusecs", position: [17.3752, 78.3021] },
  { id: "d3", name: "Singur Dam", detail: "88% storage · gates likely to open", position: [17.7472, 77.9297] },
];

export const blockedRoads: { id: string; name: string; path: LatLng[] }[] = [
  { id: "b1", name: "Begumpet flyover approach — closed", path: [[17.4405, 78.4595], [17.4462, 78.4702]] },
  { id: "b2", name: "Nampally to Chaderghat — heavy waterlogging", path: [[17.3852, 78.4646], [17.3721, 78.4855]] },
];

export const evacuationRoutes: { id: string; name: string; path: LatLng[] }[] = [
  { id: "e1", name: "Kukatpally → Serilingampally relief camp", path: [[17.4849, 78.4138], [17.4712, 78.3861], [17.4479, 78.3498]] },
  { id: "e2", name: "Begumpet → Ameerpet community hall", path: [[17.4435, 78.4645], [17.4402, 78.4552], [17.4374, 78.4487]] },
];

export const severityColor: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
};
