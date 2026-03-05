"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VillagerOption = {
  id: string;
  nameZh: string;
};

export function MailComposer({ villagers }: { villagers: VillagerOption[] }) {
  const router = useRouter();
  const [villagerId, setVillagerId] = useState(villagers[0]?.id ?? "");
  const [subject, setSubject] = useState("午后小聚");
  const [content, setContent] = useState("今天要不要一起喝咖啡？我准备了小蛋糕。");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!villagerId || !content.trim()) {
      setStatus("请先填写村民和信件内容。");
      return;
    }

    setLoading(true);
    setStatus("发送中...");

    try {
      const response = await fetch("/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          villagerId,
          subject,
          content,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        villager?: string;
        reply?: { text: string };
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus(data.error ?? "发送失败，请稍后再试。");
        return;
      }

      setStatus(`已收到${data.villager}回信：${data.reply?.text ?? ""}`);
      router.refresh();
    } catch {
      setStatus("发送失败，请检查网络后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">给村民写信</h2>
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
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="信件主题"
        />
        <textarea
          className="min-h-24 rounded-md border px-3 py-2 text-sm"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="写点想说的话..."
        />
        <button
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white disabled:opacity-50"
          type="button"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "发送中..." : "发送信件"}
        </button>
        {status ? <p className="text-xs opacity-80">{status}</p> : null}
      </div>
    </section>
  );
}
