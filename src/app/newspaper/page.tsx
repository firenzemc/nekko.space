import { store } from "@/lib/core/store";

export default function NewspaperPage() {
  const reports = store.reports;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">岛报中心</h1>

      {reports.length === 0 ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm opacity-70">
          今天的岛报还在赶稿中，明天一早就会送到。
        </section>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h2 className="text-xl font-medium">{report.title}</h2>
              <p className="mt-1 text-sm opacity-80">{report.date}</p>
              <div className="mt-3 space-y-3">
                {report.sections.map((section) => (
                  <div key={section.heading}>
                    <h3 className="font-semibold">{section.heading}</h3>
                    <p className="whitespace-pre-line text-sm">{section.body}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
