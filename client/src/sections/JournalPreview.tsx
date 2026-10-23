import { Link } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';

export function JournalPreview() {
  const { t } = useI18n();
  const { posts } = useContent();
  const latest = posts.slice(0, 3);

  return (
    <section id="journal" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('journal.eyebrow')}</p>
              <h2 className="display mt-5 text-3xl sm:text-5xl lg:text-6xl">{t('journal.title')}</h2>
            </div>
            <Link
              to="/journal"
              className="hidden shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white sm:block"
            >
              {t('common.back')} →
            </Link>
          </div>
        </Reveal>

        {latest.length === 0 ? (
          <p className="mt-12 font-mono text-sm text-white/40">{t('common.empty')}</p>
        ) : (
          <Stagger className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {latest.map((p) => (
              <StaggerItem key={p.id}>
                <Link
                  to={`/journal/${p.slug}`}
                  className="group flex flex-col gap-2 border-b border-white/10 bg-ink p-6 transition-colors hover:bg-ink-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <h3 className="font-display text-lg font-semibold text-white transition-transform duration-500 group-hover:translate-x-2">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-white/40">
                    <span>{p.excerpt.slice(0, 48)}…</span>
                    <span className="text-white/20">{p.created_at?.slice(0, 10)}</span>
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
