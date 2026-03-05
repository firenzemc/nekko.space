"use client";

import { useMemo } from "react";

export function LastUpdated({ isoString }: { isoString: string }) {
  const formatted = useMemo(() => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [isoString]);

  if (!formatted) return <span className="opacity-50">加载中...</span>;

  return <span>{formatted}</span>;
}
