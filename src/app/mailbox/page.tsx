import Link from "next/link";
import { hydrateStore, store } from "@/lib/core/store";
import { MailComposer } from "@/components/mail-composer";

export default async function MailboxPage() {
  await hydrateStore();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">岛主信箱</h1>
        <Link className="text-sm underline" href="/">
          返回岛屿总览
        </Link>
      </div>

      <section className="rounded-2xl border p-4 text-sm leading-6">
        <p>信件系统已接入 MVP2 第一版。</p>
        <p className="mt-2">发送信件：`POST /api/mail/send`，参数含 `villagerId`、`subject`、`content`。</p>
        <p className="mt-1">查看信件：`GET /api/mail/list?villagerId=merengue`。</p>
      </section>

      <section className="mt-5">
        <MailComposer
          villagers={store.world.villagers.map((villager) => ({
            id: villager.id,
            nameZh: villager.nameZh,
          }))}
        />
      </section>

      <section className="mt-5 space-y-3">
        {store.mails.length === 0 ? (
          <article className="rounded-2xl border p-4 text-sm">暂无信件，先给一位村民写信试试。</article>
        ) : (
          store.mails.slice(0, 20).map((mail) => (
            <article key={mail.id} className="rounded-2xl border p-4">
              <p className="text-xs opacity-70">{mail.createdAt}</p>
              <h2 className="mt-1 font-semibold">{mail.subject}</h2>
              <p className="mt-1 text-xs opacity-70">
                {mail.fromType === "user" ? "岛主" : mail.fromId} -&gt; {mail.toType === "user" ? "岛主" : mail.toId}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm">{mail.content}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
