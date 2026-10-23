import { Link } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';

export function Journal() {
  const { t } = useI18n();
  const { posts, loading } = useContent();

  return (
    <div className="relative pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{t('journal.eyebrow')}</p>
          <h1 className="display mt-5 text-4xl sm:text-6xl">{t('journal.title')}</h1>
          <p className="mt-5 max-w-xl text-white/55">{t('journal.subtitle')}</p>
        </Reveal>

        {loading ? (
          <p className="mt-12 font-mono text-sm text-white/40">{t('common.loading')}</p>
        ) : posts.length === 0 ? (
          <p className="mt-12 font-mono text-sm text-white/40">{t('common.empty')}</p>
        ) : (
          <Stagger className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {posts.map((p) => (
              <StaggerItem key={p.id}>
                <Link to={`/journal/${p.slug}`} className="group block py-6">
                  <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-white/40">
                    <span>{p.created_at?.slice(0, 10)}</span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white transition-transform duration-500 group-hover:translate-x-2">
                    {p.title}
                  </h2>
                  {p.excerpt && <p className="mt-2 max-w-2xl text-sm text-white/55">{p.excerpt}</p>}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
