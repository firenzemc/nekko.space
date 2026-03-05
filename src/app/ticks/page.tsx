import Link from "next/link";
import { hydrateStore, store } from "@/lib/core/store";

export default async function TicksPage() {
  await hydrateStore();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">自主决策时间线</h1>
        <Link className="text-sm underline" href="/">
          返回岛屿总览
        </Link>
      </div>

      {store.tickLogs.length === 0 ? (
        <section className="rounded-2xl border p-4 text-sm">暂无 tick 记录，等待下一轮世界推进。</section>
      ) : (
        <div className="space-y-4">
          {store.tickLogs.slice(0, 30).map((tick) => (
            <article key={tick.id} className="rounded-2xl border p-4">
              <p className="text-xs opacity-70">{tick.timestamp}</p>
              <h2 className="mt-1 text-lg font-semibold">
                {tick.timeSlot} · {tick.weather}
              </h2>
              <p className="mt-1 text-sm opacity-90">{tick.headline}</p>

              <div className="mt-3 space-y-2">
                {tick.decisions.map((decision) => (
                  <div key={`${tick.id}-${decision.villagerId}`} className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">
                      {decision.villagerName}：{decision.action}
                    </p>
                    <p className="mt-1 opacity-90">{decision.narration}</p>
                    <p className="mt-1 text-xs opacity-70">
                      心情 {decision.moodBefore} -&gt; {decision.moodAfter} · {decision.provider}/
                      {decision.model}
                      {decision.isMockFallback ? "（fallback）" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
