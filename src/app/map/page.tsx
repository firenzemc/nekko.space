import Link from "next/link";
import { hydrateStore, store } from "@/lib/core/store";
import { ISLAND_LOCATIONS, getLocationEmoji } from "@/lib/data/locations";

export default async function MapPage() {
  await hydrateStore();

  const villagersAtLocation = new Map<string, typeof store.world.villagers>();
  for (const v of store.world.villagers) {
    const existing = villagersAtLocation.get(v.location) || [];
    existing.push(v);
    villagersAtLocation.set(v.location, existing);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">🏝️ 小岛地图</h1>
        <Link className="text-sm underline" href="/">
          返回岛屿总览
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {ISLAND_LOCATIONS.map((loc) => {
          const villagers = villagersAtLocation.get(loc.name) || [];
          return (
            <article
              key={loc.id}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 min-h-32"
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{loc.emoji}</span>
                <div>
                  <h2 className="font-semibold">{loc.name}</h2>
                  <p className="text-xs opacity-70">{loc.description}</p>
                </div>
              </div>

              {villagers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
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

              {villagers.length === 0 && (
                <p className="mt-2 text-xs opacity-50">暂无村民</p>
              )}
            </article>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-lg font-semibold">🏃 村民当前位置</h2>
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
