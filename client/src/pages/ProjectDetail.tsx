import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { api } from '../lib/api';
import { CorpMarkdown } from '../lib/markdown';
import { useI18n } from '../i18n';
import type { Project } from '../context/ContentContext';

export function ProjectDetail() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Project>(`/api/projects/${slug}`)
      .then((p) => setProject(p))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-32">
        <span className="text-[12px] uppercase tracking-[0.2em] text-muted">{t('common.loading')}…</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5 pt-32">
        <div className="text-center">
          <p className="display text-4xl">404</p>
          <Link
            to="/#work"
            className="mt-6 inline-block rounded-full border border-line-strong px-5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-surface-soft"
          >
            ← {t('nav.projects')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <Link
            to="/#work"
            className="text-[12.5px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-fg"
          >
            ← {t('nav.projects')}
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="display mt-6 text-[clamp(2rem,5vw,3.6rem)] font-medium">{project.title}</h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
            <span>{project.client}</span>
            <span className="tick" />
            <span>{project.year}</span>
            {project.link && (
              <>
                <span className="tick" />
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fg underline decoration-line-strong underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Live ↗
                </a>
              </>
            )}
          </div>
        </Reveal>

        {project.cover && (
          <Reveal delay={0.14}>
            <div className="mt-9 overflow-hidden rounded-[26px] border border-line">
              <img src={project.cover} alt={project.title} className="w-full object-cover" />
            </div>
          </Reveal>
        )}

        {project.tags && (
          <Reveal delay={0.14}>
            <div className="mt-7 flex flex-wrap gap-2">
              {project.tags
                .split(',')
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted">
                    {tag.trim()}
                  </span>
                ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.16}>
          <div className="mt-10 border-t border-line pt-10">
            <CorpMarkdown markdown={project.body_md ?? ''} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-wrap gap-3 border-t border-line pt-8">
            <Link
              to="/contact"
              className="rounded-full px-5 py-3 text-[13px] font-semibold transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {t('nav.cta')}
            </Link>
            <Link
              to="/#work"
              className="rounded-full border border-line-strong px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-soft"
            >
              ← {t('nav.projects')}
            </Link>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
