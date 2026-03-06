import { hydrateStore, store } from "@/lib/core/store";
import { MailComposer } from "@/components/mail-composer";
import { TimeDisplay } from "@/components/time-display";

export default async function MailboxPage() {
  await hydrateStore();

  const nameMap = new Map(
    store.world.villagers.map((v) => [v.id, v.nameZh])
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">岛主信箱</h1>

      <section className="mt-2">
        <MailComposer
          villagers={store.world.villagers.map((v) => ({
            id: v.id,
            nameZh: v.nameZh,
          }))}
        />
      </section>

      <section className="mt-5 space-y-3">
        {store.mails.length === 0 ? (
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm opacity-70">
            暂无信件，给村民们写封信吧，他们会很开心收到你的来信。
          </article>
        ) : (
          store.mails.slice(0, 20).map((mail) => {
            const isUser = mail.fromType === "user";
            const senderName = isUser
              ? "岛主"
              : nameMap.get(mail.fromId) ?? mail.fromId;

            return (
              <article
                key={mail.id}
                className={`rounded-2xl p-4 max-w-[85%] ${
                  isUser
                    ? "ml-auto bg-[var(--accent)] text-white rounded-br-sm"
                    : "mr-auto bg-[var(--card)] border border-[var(--border)] rounded-bl-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-medium ${isUser ? "text-white/80" : "text-[var(--accent)]"}`}>
                    {senderName}
                  </p>
                  <p className={`text-xs ${isUser ? "text-white/60" : "opacity-50"}`}>
                    <TimeDisplay iso={mail.createdAt} />
                  </p>
                </div>
                <h3 className={`mt-1 font-semibold text-sm ${isUser ? "text-white" : ""}`}>
                  {mail.subject}
                </h3>
                <p className={`mt-1 whitespace-pre-line text-sm ${isUser ? "text-white/90" : ""}`}>
                  {mail.content}
                </p>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
