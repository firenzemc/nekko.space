"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OverrideRow = {
  taskKey: string;
  scope: string;
  provider: string;
  model: string;
  temperature: string;
  maxTokens: string;
};

const EMPTY_ROW: OverrideRow = {
  taskKey: "villager.dialogue",
  scope: "global",
  provider: "minimax",
  model: "minimax-m2-her",
  temperature: "0.9",
  maxTokens: "420",
};

export default function ModelAdminPage() {
  const [rows, setRows] = useState<OverrideRow[]>([EMPTY_ROW]);
  const [preview, setPreview] = useState<string>("加载中...");
  const [saving, setSaving] = useState(false);

  const fetchCurrent = useCallback(async () => {
    const response = await fetch("/api/models", { cache: "no-store" });
    const data = (await response.json()) as {
      runtimeOverrides?: Array<{
        taskKey: string;
        scope: string;
        config: {
          provider?: string;
          model?: string;
          temperature?: number;
          maxTokens?: number;
        };
      }>;
    };
    setPreview(JSON.stringify(data, null, 2));
  }, []);

  useEffect(() => {
    void fetchCurrent();
  }, [fetchCurrent]);

  const payload = useMemo(
    () => ({
      overrides: rows.map((row) => ({
        taskKey: row.taskKey,
        scope: row.scope,
        config: {
          provider: row.provider,
          model: row.model,
          temperature: Number(row.temperature),
          maxTokens: Number(row.maxTokens),
        },
      })),
    }),
    [rows]
  );

  const updateRow = (index: number, key: keyof OverrideRow, value: string) => {
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          [key]: value,
        };
      })
    );
  };

  const submit = async () => {
    setSaving(true);
    try {
      await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      await fetchCurrent();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">模型路由配置台</h1>
      <p className="mt-2 text-sm opacity-80">
        这里可以实时配置任务到模型的映射，用于调试不同角色和任务的模型表现。
      </p>

      <section className="mt-5 space-y-3 rounded-2xl border p-4">
        {rows.map((row, index) => (
          <div key={`${row.taskKey}-${index}`} className="grid gap-2 sm:grid-cols-6">
            <input
              className="rounded border px-2 py-1 text-sm"
              value={row.taskKey}
              onChange={(event) => updateRow(index, "taskKey", event.target.value)}
            />
            <input
              className="rounded border px-2 py-1 text-sm"
              value={row.scope}
              onChange={(event) => updateRow(index, "scope", event.target.value)}
            />
            <input
              className="rounded border px-2 py-1 text-sm"
              value={row.provider}
              onChange={(event) => updateRow(index, "provider", event.target.value)}
            />
            <input
              className="rounded border px-2 py-1 text-sm"
              value={row.model}
              onChange={(event) => updateRow(index, "model", event.target.value)}
            />
            <input
              className="rounded border px-2 py-1 text-sm"
              value={row.temperature}
              onChange={(event) => updateRow(index, "temperature", event.target.value)}
            />
            <input
              className="rounded border px-2 py-1 text-sm"
              value={row.maxTokens}
              onChange={(event) => updateRow(index, "maxTokens", event.target.value)}
            />
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={() => setRows((current) => [...current, EMPTY_ROW])}
            type="button"
          >
            新增一行
          </button>
          <button
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-60"
            disabled={saving}
            onClick={submit}
            type="button"
          >
            {saving ? "保存中..." : "保存配置"}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">当前配置预览</h2>
        <pre className="mt-3 overflow-auto rounded bg-black/80 p-3 text-xs text-white">{preview}</pre>
      </section>
    </main>
  );
}
