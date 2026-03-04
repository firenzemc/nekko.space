import Link from "next/link";
import { store } from "@/lib/core/store";

export default function Home() {
  const statusCards = [
    {
      title: "当前时段",
      value: store.world.timeSlot,
    },
    {
      title: "天气",
      value: store.world.weather,
    },
    {
      title: "村民数量",
      value: String(store.world.villagers.length),
    },
    {
      title: "已生成日报",
      value: String(store.reports.length),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-[var(--accent)]">小岛物语 · MVP1</p>
        <h1 className="mt-2 text-3xl font-semibold">岛屿正在持续运行中</h1>
        <p className="mt-3 text-sm leading-6 opacity-90">{store.world.headline}</p>
        <p className="mt-2 text-xs opacity-70">最后更新：{store.world.lastUpdatedAt}</p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        {statusCards.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="text-xs opacity-70">{item.title}</p>
            <p className="mt-2 text-xl font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">村民动态</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {store.world.villagers.map((villager) => (
              <li key={villager.id}>
                {villager.nameZh}（{villager.nameEn}）正在 {villager.location}，心情值 {villager.mood}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">可配置模型路由已启用</h2>
          <p className="mt-2 text-sm leading-6">
            你可以通过 `POST /api/models` 写入 runtime overrides，动态调整村民、导演、记者所用模型。
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm">
            <li>查询当前映射：`GET /api/models`</li>
            <li>世界推进：`GET /api/cron/world-tick`</li>
            <li>生成日报：`GET /api/cron/daily-report`</li>
          </ul>
        </article>
      </section>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-full border px-4 py-2 hover:bg-black/5" href="/newspaper">
          查看岛报
        </Link>
        <Link className="rounded-full border px-4 py-2 hover:bg-black/5" href="/villagers">
          村民档案
        </Link>
        <Link className="rounded-full border px-4 py-2 hover:bg-black/5" href="/mailbox">
          岛主信箱
        </Link>
        <Link className="rounded-full border px-4 py-2 hover:bg-black/5" href="/admin/models">
          模型配置台
        </Link>
      </nav>
    </main>
  );
}
