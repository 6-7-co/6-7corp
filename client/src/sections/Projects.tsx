import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';
import type { Project } from '../context/ContentContext';

function ProjectVisual({ project }: { project: Project }) {
  if (project.cover) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-ink-800">
        <img
          src={project.cover}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
    );
  }
  // Monogram placeholder
  const initials = project.title.split(' ').slice(0, 2).map((w) => w[0]).join('') || '6-7';
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-grid">
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-6xl font-bold text-white/80">{initials}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  );
}

export function Projects() {
  const { t } = useI18n();
  const { projects } = useContent();

  return (
    <section id="work" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('projects.eyebrow')}</p>
              <h2 className="display mt-5 text-3xl sm:text-5xl lg:text-6xl">{t('projects.title')}</h2>
              <p className="mt-5 max-w-xl text-white/55">{t('projects.subtitle')}</p>
            </div>
          </div>
        </Reveal>

        {projects.length === 0 ? (
          <p className="mt-12 font-mono text-sm text-white/40">{t('common.empty')}</p>
        ) : (
          <Stagger className="mt-14 grid gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <StaggerItem key={p.id}>
                <Link to={`/work/${p.slug}`} className="group block">
                  <ProjectVisual project={p} />
                  <div className="mt-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                    <span>{p.client || '—'}</span>
                    <span className="text-white/20">/</span>
                    <span>{p.year || '—'}</span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-white transition-transform duration-500 group-hover:translate-x-2">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/55">{p.excerpt}</p>
                  {p.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.split(',').map((tag) => (
                        <span
                          key={tag}
                          className="border border-white/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/60"
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
      </div>
    </section>
  );
}
