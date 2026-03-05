export const ISLAND_LOCATIONS = [
  { id: "plaza", name: "广场", emoji: "⛲", description: "小岛的中心，大家集合的地方" },
  { id: "beach", name: "海滩", emoji: "🏖️", description: "海边，可以捡贝壳、钓鱼" },
  { id: "cafe", name: "咖啡摊", emoji: "☕", description: "小润最常来的地方" },
  { id: "bakery", name: "烘焙小屋", emoji: "🍰", description: "牧牧的烘焙屋" },
  { id: "pier", name: "码头", emoji: "🛥️", description: "可以出海钓鱼" },
  { id: "garden", name: "花园", emoji: "🌸", description: "种花种菜的地方" },
  { id: "forest", name: "森林", emoji: "🌲", description: "雷姆最爱的午睡地点" },
  { id: "stage", name: "广场舞台", emoji: "🎤", description: "樱桃表演的地方" },
  { id: "track", name: "海边跑道", emoji: "🏃", description: "茶茶丸训练的地方" },
  { id: "shop", name: "Nook商店", emoji: "🏪", description: "买东西的地方" },
  { id: "museum", name: "博物馆", emoji: "🏛️", description: "展览艺术品和化石" },
  { id: "camp", name: "露营地", emoji: "⛺", description: "旅行者会来" },
] as const;

export type IslandLocationId = (typeof ISLAND_LOCATIONS)[number]["id"];

export const getRandomLocation = (): string => {
  const loc = ISLAND_LOCATIONS[Math.floor(Math.random() * ISLAND_LOCATIONS.length)];
  return loc.name;
};

export const getLocationEmoji = (name: string): string => {
  const loc = ISLAND_LOCATIONS.find(l => l.name === name);
  return loc?.emoji ?? "📍";
};
