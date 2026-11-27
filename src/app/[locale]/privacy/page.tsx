import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getPrivacyPolicy } from '@/data/privacy-policy';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { PageHero } from '@/components/site/PageHero';
import { Toc } from '@/components/insights/Toc';

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
    // 공유 미리보기 제목도 이 문서 제목으로 (없으면 홈의 사이트 문구가 붙었다)
    openGraph: { title: doc.title, description: doc.highlights[0], images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getPrivacyPolicy(locale);

  return (
    <div>
      {/* Hero */}
      <PageHero
        id="privacy-title"
        label="PRIVACY"
        en={['PRIVACY', 'POLICY.']}
        ko={doc.title}
        lead={doc.subtitle}
        size="h1"
      />

      <section className="border-t border-paper/10 bg-ink">
        <div className="wrap grid gap-x-[clamp(2.5rem,6vw,7rem)] pb-[clamp(4.5rem,10vw,9rem)] pt-[clamp(3rem,6vw,5rem)] lg:grid-cols-[15rem_minmax(0,48rem)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Toc items={doc.sections.map((section) => ({ id: section.id, text: section.title.replace(/^\d+\.\s*/, '') }))} label={locale === 'en' ? 'ON THIS PAGE' : '목차'} />
            </div>
          </aside>

          <div className="min-w-0">
            {/* 얼굴·사진 데이터 원칙 — 가장 궁금해하는 내용이라 맨 위에 둔다 */}
            <div className="border border-accent/45 bg-accent/[0.07] p-6 sm:p-9">
              <h2 className="t-kr-title text-[1.3rem] text-paper">{doc.highlightsTitle}</h2>
              <ul className="mt-5 space-y-3">
                {doc.highlights.map((line) => (
                  <li key={line} className="flex gap-3.5 text-[0.98rem] leading-relaxed text-paper/80">
                    <span className="mt-[0.62em] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="mt-14 scroll-mt-28 border-t border-paper/15 pt-8">
                <h2 className="t-kr-title text-[clamp(1.25rem,1.9vw,1.55rem)] text-paper">{section.title}</h2>

                {section.table && (
                  <div className="mt-6 overflow-x-auto border border-paper/15" data-lenis-prevent-touch>
                    <table className="w-full min-w-[520px] text-left text-[0.92rem]">
                      {section.table.head.some(Boolean) && (
                        <thead className="border-b border-paper/15 bg-paper/[0.04] text-paper/50">
                          <tr>
                            {section.table.head.map((h) => (
                              <th key={h} className="px-4 py-3 text-[0.82rem] font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody className="divide-y divide-paper/10 text-paper/70">
                        {section.table.rows.map((row) => (
                          <tr key={row.join('|')}>
                            {row.map((cell, i) => (
                              <td key={i} className={i === 0 ? 'px-4 py-3.5 align-top font-semibold text-paper' : 'px-4 py-3.5 align-top leading-relaxed'}>
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
                  <p key={p} className="mt-5 text-[0.98rem] leading-[1.85] text-paper/70">{p}</p>
                ))}

                {section.bullets && (
                  <ul className="mt-5 space-y-2.5">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex gap-3.5 text-[0.98rem] leading-[1.8] text-paper/70">
                        <span className="mt-[0.72em] h-1 w-1 shrink-0 bg-paper/40" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <p className="mt-16 border-t border-paper/15 pt-6 text-sm text-paper/45">{doc.effective}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
