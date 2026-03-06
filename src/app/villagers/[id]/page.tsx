import { hydrateStore, store } from "@/lib/core/store";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";
import { DEFAULT_VILLAGERS } from "@/lib/data/villagers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TimeDisplay } from "@/components/time-display";
import { GiftSender } from "@/components/gift-sender";
import { DatePlanner } from "@/components/date-planner";

const SPECIES_EMOJI: Record<string, string> = {
  犀牛: "🦏",
  绵羊: "🐑",
  山羊: "🐐",
  狗: "🐕",
  松鼠: "🐿️",
};

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

function MoodBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color =
    clamped >= 60 ? "#66bb6a" : clamped >= 30 ? "#ffb74d" : "#e57373";
  return (
    <div>
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

export default async function VillagerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await hydrateStore();

  const villager = store.world.villagers.find((v) => v.id === id);
  const profile = DEFAULT_VILLAGERS.find((v) => v.id === id);
  if (!villager || !profile) return notFound();

  const bio = VILLAGER_BIOS[id];
  const affinity = store.affinities.find((a) => a.villagerId === id);
  const affinityScore = affinity?.score ?? 60;
  const emoji = SPECIES_EMOJI[villager.species] ?? "🐾";
  const pColor = personalityColor[villager.personality] ?? "#ccc";

  // Life records: filter events involving this villager
  const lifeEvents = store.events
    .filter((e) => e.actors.includes(id))
    .slice(0, 20);

  // Relationships with other villagers
  const relationships = store.villagerRelationships.filter(
    (r) => r.villagerA === id || r.villagerB === id
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link
        href="/villagers"
        className="mb-4 inline-block text-sm opacity-70 hover:opacity-100"
      >
        ← 返回村民列表
      </Link>

      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)]">
        <div className="h-2" style={{ backgroundColor: pColor }} />
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar area */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-5xl"
              style={{ backgroundColor: `${pColor}20` }}
            >
              {emoji}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {villager.nameZh}{" "}
                <span className="text-base font-normal opacity-60">
                  {villager.nameEn}
                </span>
              </h1>
              <div className="mt-1 flex flex-wrap gap-2 text-sm">
                <span
                  className="rounded-full px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: pColor }}
                >
                  {personalityLabel[villager.personality]}
                </span>
                <span className="opacity-60">
                  {villager.species} · {villager.hobby}
                </span>
              </div>
              <p className="mt-2 text-sm italic opacity-60">
                &ldquo;{villager.catchphrase}&rdquo;
              </p>
              <p className="mt-1 text-sm opacity-70">
                📍 {villager.location}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MoodBar value={villager.mood} label="心情" />
            <MoodBar value={affinityScore} label="亲密度" />
          </div>
        </div>
      </section>

      {/* Bio section */}
      {bio && (
        <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">人物介绍</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-85">
            {bio.systemPromptCore}
          </p>

          <h3 className="mt-4 text-sm font-medium opacity-70">说话风格</h3>
          <p className="mt-1 text-sm opacity-75">{bio.speechStyle}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium opacity-70">喜欢</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {bio.likes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium opacity-70">不喜欢</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {bio.dislikes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {bio.quirks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium opacity-70">小趣事</h3>
              <ul className="mt-1 space-y-1 text-sm opacity-75">
                {bio.quirks.map((q) => (
                  <li key={q}>· {q}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Interactions */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <GiftSender
            villagers={[{ id: villager.id, nameZh: villager.nameZh }]}
          />
        </section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <DatePlanner
            villagers={[{ id: villager.id, nameZh: villager.nameZh }]}
          />
        </section>
      </div>

      {/* Relationships */}
      {relationships.length > 0 && (
        <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">村民关系</h2>
          <div className="mt-3 space-y-3">
            {relationships.map((rel) => {
              const otherId =
                rel.villagerA === id ? rel.villagerB : rel.villagerA;
              const other = store.world.villagers.find(
                (v) => v.id === otherId
              );
              if (!other) return null;
              const otherEmoji =
                SPECIES_EMOJI[other.species] ?? "🐾";
              return (
                <Link
                  key={`${rel.villagerA}-${rel.villagerB}`}
                  href={`/villagers/${otherId}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 hover:bg-[var(--accent-soft)] transition-colors"
                >
                  <span className="text-xl">{otherEmoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{other.nameZh}</span>
                      <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]">
                        {rel.label}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--border)]">
                      <div
                        className="h-1.5 rounded-full bg-[var(--accent)] transition-all"
                        style={{ width: `${Math.min(100, rel.score)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs opacity-50">{rel.score}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Life records */}
      <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">生活记录</h2>
        {lifeEvents.length === 0 ? (
          <p className="mt-3 text-sm opacity-50">暂无记录</p>
        ) : (
          <div className="mt-3 space-y-2">
            {lifeEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-[var(--border)] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs opacity-50">
                    <TimeDisplay iso={event.timestamp} />
                  </span>
                </div>
                <p className="mt-1 text-sm opacity-80">{event.detail}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
