"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModifyPanel({ locationHint }: { locationHint?: string } = {}) {
  const router = useRouter();
  const prefix = locationHint ? `在${locationHint}` : "";
  const [command, setCommand] = useState(prefix);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/island/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command.trim() }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCommand(prefix);
        router.refresh();
      }
    } catch {
      setResult({ error: "请求失败" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-xs opacity-70">
        用自然语言描述你想放什么，比如「放一排路灯」「添一把遮阳伞」
      </p>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={
            locationHint
              ? `在${locationHint}放点什么...`
              : "例如：在广场放一排路灯"
          }
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "..." : "放置"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-2 rounded-lg px-3 py-2 text-sm ${
            result.success
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {result.message || result.error}
        </div>
      )}
    </div>
  );
}
