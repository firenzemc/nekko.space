import { hydrateStore, store } from "@/lib/core/store";
import { TimeDisplay } from "@/components/time-display";

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

export default async function TicksPage() {
  await hydrateStore();

  const villagerSpecies = new Map(
    store.world.villagers.map((v) => [v.nameZh, v.species])
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">决策日志</h1>

      {store.tickLogs.length === 0 ? (
        <section className="rounded-2xl border p-4 text-sm">暂无记录，等待下一轮世界推进。</section>
      ) : (
        <div className="border-l-2 border-[var(--border)] ml-3 space-y-4">
          {store.tickLogs.slice(0, 30).map((tick) => (
            <article key={tick.id} className="relative ml-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              {/* Timeline dot */}
              <div className="absolute -left-[1.35rem] top-5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />

              <p className="text-xs opacity-70">
                <TimeDisplay iso={tick.timestamp} />
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {tick.timeSlot} {WEATHER_EMOJI[tick.weather] ?? ""} {tick.weather}
              </h2>
              <p className="mt-1 text-sm opacity-90">{tick.headline}</p>

              <div className="mt-3 space-y-2">
                {tick.decisions.map((d) => {
                  const species = villagerSpecies.get(d.villagerName);
                  const emoji = species ? SPECIES_EMOJI[species] ?? "🐾" : "🐾";
                  const moodDiff = d.moodAfter - d.moodBefore;
                  const moodIcon = moodDiff > 0 ? "😊" : moodDiff < 0 ? "😔" : "😐";
                  const moodArrow = moodDiff > 0 ? "↑" : moodDiff < 0 ? "↓" : "→";
                  const moodColor = moodDiff > 0 ? "text-green-600" : moodDiff < 0 ? "text-red-500" : "opacity-70";

                  return (
                    <div key={`${tick.id}-${d.villagerId}`} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                      <p className="font-medium">
                        {emoji} {d.villagerName}：{d.action}
                      </p>
                      <p className="mt-1 opacity-90">{d.narration}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className={moodColor}>
                          {moodIcon} {d.moodBefore} {moodArrow} {d.moodAfter}
                        </span>
                        {d.moodReason && (
                          <span className="italic opacity-60">{d.moodReason}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
