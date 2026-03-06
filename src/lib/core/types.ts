import type { VillagerProfile } from "@/lib/data/villagers";

export type IslandTimeSlot =
  | "清晨"
  | "上午"
  | "下午"
  | "傍晚"
  | "夜晚"
  | "深夜";

export type IslandWeather = "晴天" | "多云" | "小雨" | "阵雨";

export type WorldState = {
  dayKey: string;
  timeSlot: IslandTimeSlot;
  weather: IslandWeather;
  headline: string;
  villagers: VillagerProfile[];
  lastUpdatedAt: string;
  plotHook?: string;
};

export type IslandEvent = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  actors: string[];
  importance: number;
};

export type DailyReport = {
  id: string;
  date: string;
  title: string;
  sections: Array<{ heading: string; body: string }>;
};

export type MailMessage = {
  id: string;
  fromType: "user" | "villager";
  fromId: string;
  toType: "user" | "villager";
  toId: string;
  villagerId: string;
  subject: string;
  content: string;
  createdAt: string;
};

export type VillagerAffinity = {
  villagerId: string;
  score: number;
  lastInteractionAt: string;
};

export type VillagerRelationship = {
  villagerA: string;
  villagerB: string;
  score: number;
  label: string;
  lastUpdatedAt: string;
};

export type VillagerDecision = {
  villagerId: string;
  villagerName: string;
  action: string;
  narration: string;
  moodBefore: number;
  moodAfter: number;
  provider: string;
  model: string;
  isMockFallback: boolean;
  moodReason?: string;
};

export type TickLog = {
  id: string;
  timestamp: string;
  timeSlot: IslandTimeSlot;
  weather: IslandWeather;
  headline: string;
  decisions: VillagerDecision[];
};
