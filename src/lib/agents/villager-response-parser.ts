import { ISLAND_LOCATIONS } from "@/lib/data/locations";

export type ParsedVillagerResponse = {
  location: string;
  action: string;
  moodDelta: number;
  moodReason: string;
  narration: string;
};

const locationNames = ISLAND_LOCATIONS.map((l) => l.name);

const fuzzyMatchLocation = (raw: string): string | null => {
  const trimmed = raw.trim();
  // Exact match
  const exact = locationNames.find((n) => n === trimmed);
  if (exact) return exact;
  // Contains match
  const contains = locationNames.find(
    (n) => trimmed.includes(n) || n.includes(trimmed)
  );
  return contains ?? null;
};

const extractField = (text: string, tag: string): string | null => {
  // Match 【tag】content (until next 【 or newline)
  const re = new RegExp(`【${tag}】\\s*([^【\\n]+)`);
  const m = text.match(re);
  return m?.[1]?.trim() ?? null;
};

const parseMoodDelta = (raw: string): { delta: number; reason: string } => {
  // Match patterns like "+3，因为xxx" or "-2，心情不好" or just "+3"
  const m = raw.match(/([+-]?\d+)[，,]?\s*(.*)/);
  if (!m) return { delta: 0, reason: raw };
  const delta = Math.max(-5, Math.min(5, parseInt(m[1], 10) || 0));
  return { delta, reason: m[2] || "" };
};

export const parseVillagerResponse = (
  raw: string,
  currentLocation: string,
  fallbackAction: string
): ParsedVillagerResponse => {
  const locationRaw = extractField(raw, "地点");
  const actionRaw = extractField(raw, "行动");
  const moodRaw = extractField(raw, "心情变化");
  const narrationRaw = extractField(raw, "旁白");

  // Location: validate against known locations, fallback to current
  const location = locationRaw
    ? fuzzyMatchLocation(locationRaw) ?? currentLocation
    : currentLocation;

  // Action: use parsed or fallback
  const action = actionRaw || fallbackAction;

  // Mood delta: parse number and reason
  const { delta: moodDelta, reason: moodReason } = moodRaw
    ? parseMoodDelta(moodRaw)
    : { delta: 0, reason: "" };

  // Narration: use parsed or raw text as fallback
  const narration = narrationRaw || raw.slice(0, 200);

  return { location, action, moodDelta, moodReason, narration };
};
