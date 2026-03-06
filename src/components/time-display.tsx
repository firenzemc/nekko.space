"use client";

import { useMemo } from "react";

export function TimeDisplay({ iso }: { iso: string }) {
  const formatted = useMemo(() => {
    if (!iso) return "";
    const date = new Date(iso);
    const now = new Date();

    const isToday = date.toLocaleDateString() === now.toLocaleDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toLocaleDateString() === yesterday.toLocaleDateString();

    const time = date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `今天 ${time}`;
    if (isYesterday) return `昨天 ${time}`;

    return date.toLocaleDateString("zh-CN", {
      month: "numeric",
      day: "numeric",
    }) + " " + time;
  }, [iso]);

  if (!formatted) return <span className="opacity-50">...</span>;
  return <span>{formatted}</span>;
}
