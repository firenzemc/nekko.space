"use client";

import { useState } from "react";

export function ModifyPanel() {
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
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
        setCommand("");
      }
    } catch {
      setResult({ error: "请求失败" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-lg font-semibold">🏗️ 岛屿改造</h2>
      <p className="mt-1 text-xs opacity-70">
        用自然语言描述你想对岛屿做什么，例如：&quot;在广场放一个长椅&quot;、&quot;移除海滩的灯笼&quot;
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="例如：在花园放一个花盆"
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "处理中..." : "执行"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            result.success
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {result.message || result.error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs opacity-60">
        <span>示例：</span>
        <span className="rounded bg-black/5 px-2 py-0.5">在广场放长椅</span>
        <span className="rounded bg-black/5 px-2 py-0.5">花园放花盆</span>
        <span className="rounded bg-black/5 px-2 py-0.5">海滩放灯笼</span>
        <span className="rounded bg-black/5 px-2 py-0.5">移除桌子</span>
      </div>
    </section>
  );
}
