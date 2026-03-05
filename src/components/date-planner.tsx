"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VillagerOption = {
  id: string;
  nameZh: string;
};

export function DatePlanner({ villagers }: { villagers: VillagerOption[] }) {
  const router = useRouter();
  const [villagerId, setVillagerId] = useState(villagers[0]?.id ?? "");
  const [location, setLocation] = useState("海滩");
  const [activity, setActivity] = useState("捡贝壳");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!villagerId || !location.trim() || !activity.trim()) {
      setStatus("请选择村民并填写地点和活动。");
      return;
    }

    setLoading(true);
    setStatus("赴约中...");

    try {
      const response = await fetch("/api/date/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          villagerId,
          location,
          activity
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        villager?: string;
        reply?: { text: string };
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus(data.error ?? "约会失败，请稍后再试。");
        return;
      }

      setStatus(`约会愉快！${data.villager}说：${data.reply?.text ?? ""}`);
      router.refresh();
    } catch {
      setStatus("约会失败，请检查网络后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">特别约会</h2>
      <div className="mt-3 grid gap-3">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={villagerId}
          onChange={(event) => setVillagerId(event.target.value)}
        >
          {villagers.map((villager) => (
            <option key={villager.id} value={villager.id}>
              {villager.nameZh}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border px-3 py-2 text-sm"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="地点 (例如: 咖啡馆, 广场)"
        />
         <input
          className="rounded-md border px-3 py-2 text-sm"
          value={activity}
          onChange={(event) => setActivity(event.target.value)}
          placeholder="活动 (例如: 喝下午茶, 散步)"
        />
        <button
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white disabled:opacity-50"
          type="button"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "赴约中..." : "开始约会"}
        </button>
        {status ? <p className="text-xs opacity-80 whitespace-pre-line">{status}</p> : null}
      </div>
    </section>
  );
}