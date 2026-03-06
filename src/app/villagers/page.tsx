import { hydrateStore, store } from "@/lib/core/store";
import { GiftSender } from "@/components/gift-sender";
import { DatePlanner } from "@/components/date-planner";

const personalityLabel: Record<string, string> = {
  normal: "普通",
  jock: "运动",
  lazy: "悠闲",
  sisterly: "大姐",
  smug: "自恋",
};

const personalityColor: Record<string, string> = {
  normal: "#f8b4c8",
  jock: "#ffa726",
  lazy: "#90caf9",
  sisterly: "#ef5350",
  smug: "#ce93d8",
};

const SPECIES_EMOJI: Record<string, string> = {
  犀牛: "🦏",
  绵羊: "🐑",
  山羊: "🐐",
  狗: "🐕",
  松鼠: "🐿️",
};

function MoodBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = clamped >= 60 ? "#66bb6a" : clamped >= 30 ? "#ffb74d" : "#e57373";
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs opacity-70">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-[var(--border)]">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default async function VillagersPage() {
  await hydrateStore();

  const affinityByVillager = new Map(
    store.affinities.map((affinity) => [affinity.villagerId, affinity.score])
  );

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">村民档案</h1>

      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <section>
          <GiftSender
            villagers={store.world.villagers.map((v) => ({
              id: v.id,
              nameZh: v.nameZh,
            }))}
          />
        </section>
        <section>
          <DatePlanner
            villagers={store.world.villagers.map((v) => ({
              id: v.id,
              nameZh: v.nameZh,
            }))}
          />
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {store.world.villagers.map((villager) => {
          const affinity = affinityByVillager.get(villager.id) ?? 60;
          return (
            <article
              key={villager.id}
              className="rounded-2xl border border-[var(--border)] overflow-hidden"
            >
              {/* Personality color bar */}
              <div
                className="h-1.5"
                style={{ backgroundColor: personalityColor[villager.personality] ?? "#ccc" }}
              />
              <div className="p-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <span className="text-2xl">{SPECIES_EMOJI[villager.species] ?? "🐾"}</span>
                  {villager.nameZh}
                  <span className="text-sm opacity-70">{villager.nameEn}</span>
                </h2>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="opacity-70">性格</span>{" "}
                    {personalityLabel[villager.personality]}{" "}
                    <span className="opacity-50">·</span>{" "}
                    <span className="opacity-70">爱好</span> {villager.hobby}
                  </p>
                  <p>
                    <span className="opacity-70">位置</span> {villager.location}
                  </p>
                  <p className="italic opacity-60">&ldquo;{villager.catchphrase}&rdquo;</p>
                </div>

                <MoodBar value={villager.mood} label="心情" />
                <MoodBar value={affinity} label="亲密度" />
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
