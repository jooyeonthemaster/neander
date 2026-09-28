import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getPrivacyPolicy } from '@/data/privacy-policy';
import { localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const doc = getPrivacyPolicy(locale);
  return {
    alternates: localeAlternates('/privacy', locale),
    title: doc.title,
    description: doc.highlights[0],
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getPrivacyPolicy(locale);

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-950 pb-16 pt-32 sm:pb-20 sm:pt-40">
        <div className="container-wide">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-400">
            {doc.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            {/* 얼굴·사진 데이터 원칙 — 가장 궁금해하는 내용이라 맨 위에 둔다 */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">{doc.highlightsTitle}</h2>
              <ul className="mt-4 space-y-2.5">
                {doc.highlights.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="mt-12 scroll-mt-28">
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>

                {section.table && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      {section.table.head.some(Boolean) && (
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            {section.table.head.map((h) => (
                              <th key={h} className="px-4 py-3 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {section.table.rows.map((row) => (
                          <tr key={row.join('|')}>
                            {row.map((cell, i) => (
                              <td key={i} className={i === 0 ? 'px-4 py-3 font-medium text-slate-900' : 'px-4 py-3'}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.paragraphs?.map((p) => (
                  <p key={p} className="mt-4 text-sm leading-relaxed text-slate-600">{p}</p>
                ))}

                {section.bullets && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
                    {section.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
              </section>
            ))}

            <p className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">{doc.effective}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
