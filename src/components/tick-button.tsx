"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function TickButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");

  const handleTick = useCallback(async () => {
    if (loading || cooldown > 0) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/tick/manual", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        setCooldown(data.cooldownSeconds || 30);
        setMessage(`冷却中...`);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setMessage("");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      if (data.ok) {
        setMessage(`${data.timeSlot} ${data.weather}`);
        // Start 30s cooldown
        setCooldown(30);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setMessage("");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        router.refresh();
      } else {
        setMessage(data.error || "推进失败");
      }
    } catch {
      setMessage("网络错误");
    } finally {
      setLoading(false);
    }
  }, [loading, cooldown, router]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleTick}
        disabled={loading || cooldown > 0}
        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-opacity"
      >
        {loading
          ? "推进中..."
          : cooldown > 0
            ? `冷却 ${cooldown}s`
            : "⏩ 推进世界"}
      </button>
      {message && (
        <span className="text-xs opacity-70">{message}</span>
      )}
    </div>
  );
}
