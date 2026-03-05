"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VillagerOption = {
  id: string;
  nameZh: string;
};

export function GiftSender({ villagers }: { villagers: VillagerOption[] }) {
  const router = useRouter();
  const [villagerId, setVillagerId] = useState(villagers[0]?.id ?? "");
  const [giftName, setGiftName] = useState("草莓小蛋糕");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!villagerId || !giftName.trim()) {
      setStatus("请先选择村民并填写礼物名称。");
      return;
    }

    setLoading(true);
    setStatus("送礼中...");

    try {
      const response = await fetch("/api/gift/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          villagerId,
          giftName,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        villager?: string;
        affinity?: { score: number };
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus(data.error ?? "送礼失败，请稍后重试。");
        return;
      }

      setStatus(`已送出，${data.villager}亲密度变为 ${data.affinity?.score ?? "-"}`);
      router.refresh();
    } catch {
      setStatus("送礼失败，请检查网络后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">给村民送礼物</h2>
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
          value={giftName}
          onChange={(event) => setGiftName(event.target.value)}
          placeholder="礼物名称"
        />
        <button
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white disabled:opacity-50"
          type="button"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "送礼中..." : "送出礼物"}
        </button>
        {status ? <p className="text-xs opacity-80">{status}</p> : null}
      </div>
    </section>
  );
}
