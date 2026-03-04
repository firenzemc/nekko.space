// MVP1 使用内存存储；本文件用于定义后续 Neon + Drizzle 的数据结构目标。

export type DbWorldState = {
  dayKey: string;
  timeSlot: string;
  weather: string;
  headline: string;
  lastUpdatedAt: string;
};

export type DbEvent = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  actors: string[];
  importance: number;
};

export type DbModelOverride = {
  id: string;
  taskKey: string;
  scope: string;
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};
