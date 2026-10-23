import { Link } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';
import { JOURNAL } from '../content';
import { formatDate } from '../lib/format';

export function Journal() {
  const { pick, t, lang } = useI18n();
  const { posts, loading } = useContent();

  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{pick(JOURNAL.eyebrow)}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="display mt-4 text-[clamp(2.2rem,5.5vw,4rem)] font-medium">{pick(JOURNAL.title)}</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="lead mt-5 max-w-xl">{pick(JOURNAL.subtitle)}</p>
        </Reveal>

        {loading ? (
          <p className="mt-14 text-sm text-muted">{t('common.loading')}…</p>
        ) : posts.length === 0 ? (
          <Reveal delay={0.1}>
            <p className="mt-14 rounded-[26px] border border-line bg-surface px-7 py-10 text-sm text-muted">
              {pick(JOURNAL.empty)}
            </p>
          </Reveal>
        ) : (
          <Stagger className="mt-14 divide-y divide-line border-y border-line">
            {posts.map((p) => (
              <StaggerItem key={p.id}>
                <Link
                  to={`/journal/${p.slug}`}
                  className="group flex flex-col gap-2 py-7 transition-colors hover:bg-surface/40 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div className="min-w-0">
                    <h2 className="font-display text-[20px] font-semibold tracking-[-0.025em] transition-colors group-hover:text-fg/80">
                      {p.title}
                    </h2>
                    {p.excerpt && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">{p.excerpt}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[12.5px] text-muted">
                    <time>{formatDate(p.created_at, lang)}</time>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
