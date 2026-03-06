import { hydrateStore, store } from "@/lib/core/store";
import { ISLAND_LOCATIONS, getLocationEmoji } from "@/lib/data/locations";
import { LOCATION_PROFILES } from "@/lib/data/location-profiles";
import { ModifyPanel } from "@/components/modify-panel";

const WEATHER_EMOJI: Record<string, string> = {
  晴天: "☀️",
  多云: "⛅",
  小雨: "🌧️",
  阵雨: "⛈️",
};

export default async function MapPage() {
  await hydrateStore();

  const { timeSlot, weather } = store.world;

  const villagersAtLocation = new Map<string, typeof store.world.villagers>();
  for (const v of store.world.villagers) {
    const existing = villagersAtLocation.get(v.location) || [];
    existing.push(v);
    villagersAtLocation.set(v.location, existing);
  }

  const furnitureAtLocation = store.furniture || {};

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">小岛地图</h1>
      <p className="mb-4 text-sm opacity-70">
        {timeSlot} {WEATHER_EMOJI[weather] ?? ""} {weather}
      </p>

      <ModifyPanel />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {ISLAND_LOCATIONS.map((loc) => {
          const villagers = villagersAtLocation.get(loc.name) || [];
          const furniture = furnitureAtLocation[loc.name] || [];
          const profile = LOCATION_PROFILES[loc.id];
          const atmosphere = profile?.atmosphereByTimeSlot[timeSlot];
          const weatherEffect = profile?.weatherEffects[weather];
          const hasVillagers = villagers.length > 0;

          return (
            <article
              key={loc.id}
              className={`relative rounded-2xl border bg-[var(--card)] p-4 min-h-32 ${
                hasVillagers
                  ? "border-[var(--accent)]/50"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{loc.emoji}</span>
                <div>
                  <h2 className="font-semibold">{loc.name}</h2>
                  <p className="text-xs opacity-70">{loc.description}</p>
                </div>
              </div>

              {atmosphere && (
                <p className="mt-2 text-xs italic opacity-60">{atmosphere}</p>
              )}
              {weatherEffect && (
                <p className="mt-1 text-xs opacity-50">{WEATHER_EMOJI[weather]} {weatherEffect}</p>
              )}

              {furniture.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {furniture.map((f) => (
                    <span
                      key={f.id}
                      className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs"
                      title={`添加于 ${new Date(f.addedAt).toLocaleDateString()}`}
                    >
                      {f.emoji} {f.name}
                    </span>
                  ))}
                </div>
              )}

              {hasVillagers && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {villagers.map((v) => (
                    <span
                      key={v.id}
                      className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]"
                    >
                      {v.nameZh}
                    </span>
                  ))}
                </div>
              )}

              {!hasVillagers && furniture.length === 0 && (
                <p className="mt-2 text-xs opacity-50">暂无村民和家具</p>
              )}
            </article>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-lg font-semibold">村民当前位置</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {store.world.villagers.map((v) => (
            <li key={v.id} className="flex items-center gap-2">
              <span>{getLocationEmoji(v.location)}</span>
              <span className="font-medium">{v.nameZh}</span>
              <span className="opacity-70">在 {v.location}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
