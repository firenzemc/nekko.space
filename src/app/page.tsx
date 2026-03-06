import { store } from "@/lib/core/store";
import { LastUpdated } from "@/components/last-updated";
import { deriveSeason, getIslandDate } from "@/lib/world/clock";

const WEATHER_EMOJI: Record<string, string> = {
  晴天: "☀️",
  多云: "⛅",
  小雨: "🌧️",
  阵雨: "⛈️",
};

const SPECIES_EMOJI: Record<string, string> = {
  犀牛: "🦏",
  绵羊: "🐑",
  山羊: "🐐",
  狗: "🐕",
  松鼠: "🐿️",
};

export default function Home() {
  const island = getIslandDate();
  const season = deriveSeason(island.month);

  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* Hero */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <p className="text-sm tracking-wide text-[var(--accent)]">小岛物语</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {WEATHER_EMOJI[store.world.weather] ?? "🏝️"}{" "}
          {store.world.headline}
        </h1>
        <p className="mt-3 text-sm opacity-70">
          <LastUpdated isoString={store.world.lastUpdatedAt} />
        </p>
      </section>

      {/* Status cards */}
      <section className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs opacity-70">时段</p>
          <p className="mt-2 text-xl font-semibold">{store.world.timeSlot}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs opacity-70">天气</p>
          <p className="mt-2 text-xl font-semibold">
            {WEATHER_EMOJI[store.world.weather]} {store.world.weather}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs opacity-70">季节</p>
          <p className="mt-2 text-xl font-semibold">{season}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs opacity-70">村民</p>
          <p className="mt-2 text-xl font-semibold">{store.world.villagers.length} 位</p>
        </div>
      </section>

      {/* Villager overview */}
      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-lg font-semibold">村民速览</h2>
        <div className="mt-3 space-y-2">
          {store.world.villagers.map((v) => (
            <div key={v.id} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{SPECIES_EMOJI[v.species] ?? "🐾"}</span>
              <span className="font-medium w-16 shrink-0">{v.nameZh}</span>
              <span className="opacity-70 shrink-0">{v.location}</span>
              <div className="flex-1 ml-2">
                <div className="h-2 w-full rounded-full bg-[var(--border)]">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, v.mood))}%`,
                      backgroundColor:
                        v.mood >= 60 ? "#66bb6a" : v.mood >= 30 ? "#ffb74d" : "#e57373",
                    }}
                  />
                </div>
              </div>
              <span className="text-xs opacity-50 w-6 text-right">{v.mood}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* Recent events */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">最近动态</h2>
          {store.events.length === 0 ? (
            <p className="mt-3 text-sm opacity-70">暂无事件，等待下一轮世界推进。</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {store.events.slice(0, 3).map((evt) => (
                <li key={evt.id} className="border-l-2 border-[var(--accent)] pl-3">
                  <p className="font-medium">{evt.title}</p>
                  <p className="opacity-70 text-xs line-clamp-2">{evt.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Plot hook */}
        {store.world.plotHook ? (
          <section className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
            <h2 className="text-lg font-semibold text-[var(--accent)]">剧情线索</h2>
            <p className="mt-3 text-sm leading-6">{store.world.plotHook}</p>
          </section>
        ) : (
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-lg font-semibold">岛屿宁静</h2>
            <p className="mt-3 text-sm opacity-70">
              目前没有特别的剧情线索，岛上一切平静。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
