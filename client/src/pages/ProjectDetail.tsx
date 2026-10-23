import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { CorpMarkdown } from '../lib/markdown';
import { Reveal } from '../components/Reveal';
import type { Project } from '../context/ContentContext';

export function ProjectDetail() {
  const { slug } = useParams();
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
      <div className="grid min-h-[60vh] place-items-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Loading…</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <p className="display text-4xl">404</p>
          <Link to="/" className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="relative pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <Link
            to="/#work"
            className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            ← {project.client || 'Work'}
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="display mt-6 text-4xl sm:text-6xl">{project.title}</h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            <span>{project.client}</span>
            <span className="text-white/20">/</span>
            <span>{project.year}</span>
            {project.link && (
              <>
                <span className="text-white/20">/</span>
                <a href={project.link} target="_blank" rel="noreferrer noopener" className="text-white/70 hover:text-white">
                  Live ↗
                </a>
              </>
            )}
          </div>
        </Reveal>

        {project.cover && (
          <Reveal delay={0.15}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <img src={project.cover} alt={project.title} className="w-full object-cover grayscale" />
            </div>
          </Reveal>
        )}

        {project.tags && (
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.tags.split(',').map((tag) => (
                <span key={tag} className="border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/60">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-10">
          <CorpMarkdown markdown={project.body_md ?? ''} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-white/10 pt-8"
        >
          <Link
            to="/#work"
            className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            ← Back to work
          </Link>
        </motion.div>
      </div>
    </article>
  );
}
