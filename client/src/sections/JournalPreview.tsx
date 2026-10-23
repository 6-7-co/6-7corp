import { Link } from 'react-router-dom';
import { Reveal, SectionHeading, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';
import { JOURNAL } from '../content';
import { formatDate } from '../lib/format';

export function JournalPreview() {
  const { pick, t, lang } = useI18n();
  const { posts } = useContent();
  const latest = posts.slice(0, 3);

  return (
    <section id="journal" className="relative scroll-mt-28 border-t border-line py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={pick(JOURNAL.eyebrow)}
          title={pick(JOURNAL.title)}
          lead={pick(JOURNAL.subtitle)}
          action={
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-surface-soft"
            >
              {t('common.readAll')}
              <span aria-hidden="true">→</span>
            </Link>
          }
        />

        {latest.length === 0 ? (
          <Reveal className="mt-12">
            <p className="rounded-[26px] border border-line bg-surface px-7 py-10 text-sm text-muted">
              {pick(JOURNAL.empty)}
            </p>
          </Reveal>
        ) : (
          <Stagger className="mt-12 overflow-hidden rounded-[26px] border border-line">
            {latest.map((p) => (
              <StaggerItem key={p.id}>
                <Link
                  to={`/journal/${p.slug}`}
                  className="group flex flex-col gap-3 border-b border-line bg-surface px-7 py-6 transition-colors last:border-b-0 hover:bg-surface-soft sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-[17px] font-semibold tracking-[-0.02em]">{p.title}</h3>
                    {p.excerpt && (
                      <p className="mt-1.5 line-clamp-1 max-w-xl text-[13.5px] text-muted">{p.excerpt}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
                    <time>{formatDate(p.created_at, lang)}</time>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
