import Link from "next/link";
import { hydrateStore, store } from "@/lib/core/store";
import { GiftSender } from "@/components/gift-sender";
import { DatePlanner } from "@/components/date-planner";

const personalityLabel = {
  normal: "普通",
  jock: "运动",
  lazy: "悠闲",
  sisterly: "大姐",
  smug: "自恋",
};

export default async function VillagersPage() {
  await hydrateStore();

  const affinityByVillager = new Map(
    store.affinities.map((affinity) => [affinity.villagerId, affinity.score])
  );

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">村民档案</h1>
        <Link className="text-sm underline" href="/">
          返回岛屿总览
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <section>
          <GiftSender
            villagers={store.world.villagers.map((villager) => ({
              id: villager.id,
              nameZh: villager.nameZh,
            }))}
          />
        </section>
        <section>
           <DatePlanner
            villagers={store.world.villagers.map((villager) => ({
              id: villager.id,
              nameZh: villager.nameZh,
            }))}
          />
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {store.world.villagers.map((villager) => (
          <article key={villager.id} className="rounded-2xl border p-4">
            <h2 className="text-xl font-medium">
              {villager.nameZh}
              <span className="ml-2 text-sm opacity-70">{villager.nameEn}</span>
            </h2>
            <div className="mt-2 space-y-1 text-sm">
              <p>种族：{villager.species}</p>
              <p>性格：{personalityLabel[villager.personality]}</p>
              <p>爱好：{villager.hobby}</p>
              <p>口头禅：{villager.catchphrase}</p>
              <p>当前位置：{villager.location}</p>
            </div>
            <p className="mt-3 text-sm">
              心情值：
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 font-medium text-[var(--accent)]">
                {villager.mood}
              </span>
            </p>
            <p className="mt-2 text-sm">
              亲密度：
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 font-medium text-[var(--accent)]">
                {affinityByVillager.get(villager.id) ?? 60}
              </span>
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
