import type { IslandTimeSlot, IslandWeather } from "@/lib/core/types";

export type IslandSeason = "春" | "夏" | "秋" | "冬";

/** Returns date/time components in Asia/Shanghai (UTC+8) timezone. */
export const getIslandDate = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour") % 24;

  const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return { year, month, day, hour, dayKey, iso: now.toISOString() };
};

export const deriveTimeSlot = (hour: number): IslandTimeSlot => {
  if (hour >= 5 && hour < 8) return "清晨";
  if (hour >= 8 && hour < 12) return "上午";
  if (hour >= 12 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  if (hour >= 20 && hour < 23) return "夜晚";
  return "深夜";
};

export const deriveSeason = (month: number): IslandSeason => {
  if (month >= 3 && month <= 5) return "春";
  if (month >= 6 && month <= 8) return "夏";
  if (month >= 9 && month <= 11) return "秋";
  return "冬";
};

type WeightedWeather = [IslandWeather, number][];

const SEASONAL_WEATHER: Record<string, WeightedWeather> = {
  "1-2": [["多云", 40], ["小雨", 25], ["晴天", 25], ["阵雨", 10]],
  "3-4": [["小雨", 35], ["多云", 30], ["晴天", 25], ["阵雨", 10]],
  "5-6": [["小雨", 35], ["阵雨", 30], ["多云", 20], ["晴天", 15]],
  "7-8": [["晴天", 50], ["阵雨", 25], ["多云", 15], ["小雨", 10]],
  "9-10": [["晴天", 45], ["多云", 30], ["小雨", 15], ["阵雨", 10]],
  "11-12": [["多云", 40], ["晴天", 25], ["小雨", 25], ["阵雨", 10]],
};

const getSeasonKey = (month: number): string => {
  if (month <= 2) return "1-2";
  if (month <= 4) return "3-4";
  if (month <= 6) return "5-6";
  if (month <= 8) return "7-8";
  if (month <= 10) return "9-10";
  return "11-12";
};

export const nextSeasonalWeather = (month: number): IslandWeather => {
  const weights = SEASONAL_WEATHER[getSeasonKey(month)];
  if (!weights) return "晴天";

  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const [weather, weight] of weights) {
    cumulative += weight;
    if (roll < cumulative) return weather;
  }
  return weights[0]?.[0] ?? "晴天";
};

/** @deprecated Use nextSeasonalWeather instead */
export const nextWeather = (): IslandWeather => {
  const { month } = getIslandDate();
  return nextSeasonalWeather(month);
};
