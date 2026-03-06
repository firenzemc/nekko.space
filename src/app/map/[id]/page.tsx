import { hydrateStore, store } from "@/lib/core/store";
import { ISLAND_LOCATIONS } from "@/lib/data/locations";
import { LOCATION_PROFILES } from "@/lib/data/location-profiles";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModifyPanel } from "@/components/modify-panel";

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

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await hydrateStore();

  const location = ISLAND_LOCATIONS.find((l) => l.id === id);
  if (!location) return notFound();

  const profile = LOCATION_PROFILES[id];
  const { timeSlot, weather } = store.world;
  const atmosphere = profile?.atmosphereByTimeSlot[timeSlot];
  const weatherEffect = profile?.weatherEffects[weather];

  const villagersHere = store.world.villagers.filter(
    (v) => v.location === location.name
  );
  const furniture = store.furniture[location.name] || [];

  const associatedVillager = profile?.associatedVillager
    ? store.world.villagers.find((v) => v.id === profile.associatedVillager)
    : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link
        href="/map"
        className="mb-4 inline-block text-sm opacity-70 hover:opacity-100"
      >
        ← 返回地图
      </Link>

      {/* Hero */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{location.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{location.name}</h1>
            <p className="mt-1 text-sm opacity-70">{location.description}</p>
          </div>
        </div>

        {/* Current atmosphere */}
        {atmosphere && (
          <div className="mt-4 rounded-xl bg-[var(--accent-soft)] p-3">
            <p className="text-sm italic text-[var(--foreground)]">
              🕐 {timeSlot} — {atmosphere}
            </p>
          </div>
        )}
        {weatherEffect && (
          <p className="mt-2 text-sm opacity-60">
            {WEATHER_EMOJI[weather]} {weatherEffect}
          </p>
        )}

        {associatedVillager && (
          <p className="mt-3 text-sm">
            🏠{" "}
            <Link
              href={`/villagers/${associatedVillager.id}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              {associatedVillager.nameZh}
            </Link>
            的主场
          </p>
        )}
      </section>

      {/* Villagers present */}
      <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">当前在场</h2>
        {villagersHere.length === 0 ? (
          <p className="mt-2 text-sm opacity-50">此刻没有村民在这里</p>
        ) : (
          <div className="mt-3 space-y-2">
            {villagersHere.map((v) => {
              const emoji = SPECIES_EMOJI[v.species] ?? "🐾";
              return (
                <Link
                  key={v.id}
                  href={`/villagers/${v.id}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 hover:bg-[var(--accent-soft)] transition-colors"
                >
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <span className="font-medium">{v.nameZh}</span>
                    <span className="ml-2 text-xs opacity-50">
                      心情 {v.mood}/100
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Furniture / Scene setup */}
      <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">场景布置</h2>
        {furniture.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {furniture.map((f) => (
              <span
                key={f.id}
                className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-sm"
              >
                {f.emoji} {f.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm opacity-50">还没有放置任何物品</p>
        )}

        <div className="mt-4">
          <ModifyPanel locationHint={location.name} />
        </div>
      </section>

      {/* Activities & narrative hooks */}
      {profile && (
        <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">这里可以做什么</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.typicalActivities.map((a) => (
              <span
                key={a}
                className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]"
              >
                {a}
              </span>
            ))}
          </div>

          {profile.narrativeHooks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium opacity-70">
                可能发生的故事
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.narrativeHooks.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs opacity-70"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
