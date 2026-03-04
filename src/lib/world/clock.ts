import type { IslandTimeSlot, IslandWeather } from "@/lib/core/types";

export const deriveTimeSlot = (hour: number): IslandTimeSlot => {
  if (hour >= 5 && hour < 8) return "清晨";
  if (hour >= 8 && hour < 12) return "上午";
  if (hour >= 12 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  if (hour >= 20 && hour < 23) return "夜晚";
  return "深夜";
};

const WEATHER_POOL: IslandWeather[] = ["晴天", "多云", "小雨", "阵雨"];

export const nextWeather = (): IslandWeather => {
  const index = Math.floor(Math.random() * WEATHER_POOL.length);
  return WEATHER_POOL[index] ?? "晴天";
};
