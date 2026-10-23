import { Link } from 'react-router-dom';
import { Reveal, SectionHeading, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';
import type { Project } from '../context/ContentContext';
import { WORK } from '../content';

function ProjectVisual({ project }: { project: Project }) {
  if (project.cover) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-line bg-ink-800">
        <img
          src={project.cover}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const initials = project.title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-line bg-ink-800">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(120% 120% at 20% 10%, var(--surface-soft), transparent 60%), radial-gradient(90% 90% at 90% 90%, color-mix(in oklab, var(--accent-b) 22%, transparent), transparent 60%)',
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-6xl font-medium tracking-[-0.05em] text-fg/25 transition-transform duration-700 group-hover:scale-105">
          {initials}
        </span>
      </div>
    </div>
  );
}

export function Projects() {
  const { pick, t } = useI18n();
  const { projects } = useContent();

  return (
    <section id="work" className="relative scroll-mt-28 border-t border-line py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={pick(WORK.eyebrow)}
          title={pick(WORK.title)}
          lead={pick(WORK.subtitle)}
        />

        {projects.length === 0 ? (
          <p className="mt-12 text-sm text-muted">{t('common.empty')}</p>
        ) : (
          <Stagger className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-2">
            {projects.map((p) => (
              <StaggerItem key={p.id}>
                <Link to={`/work/${p.slug}`} className="group block">
                  <ProjectVisual project={p} />
                  <div className="mt-6 flex items-center gap-2.5 text-[12px] text-muted">
                    <span>{p.client || '—'}</span>
                    <span className="tick" />
                    <span>{p.year || '—'}</span>
                  </div>
                  <h3 className="mt-2 font-display text-[22px] font-semibold tracking-[-0.025em] transition-colors group-hover:text-fg/80">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">{p.excerpt}</p>
                  {p.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.split(',').filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {projects.length > 0 && (
          <Reveal className="mt-14">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-soft"
            >
              {t('nav.cta')}
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
