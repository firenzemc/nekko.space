import Link from "next/link";

export default function MailboxPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">岛主信箱</h1>
        <Link className="text-sm underline" href="/">
          返回岛屿总览
        </Link>
      </div>

      <section className="rounded-2xl border p-4 text-sm leading-6">
        <p>信件系统会在 MVP2 完整接入。</p>
        <p className="mt-2">当前阶段已保留接口：`villager.letter` 模型可配置，后续会直接接入收发逻辑。</p>
      </section>
    </main>
  );
}
