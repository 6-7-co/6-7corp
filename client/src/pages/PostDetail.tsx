import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CorpMarkdown } from '../lib/markdown';
import { Reveal } from '../components/Reveal';
import { useI18n } from '../i18n';
import { formatDate } from '../lib/format';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  body_md: string;
  created_at: string;
};

export function PostDetail() {
  const { slug } = useParams();
  const { lang, t } = useI18n();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Post>(`/api/posts/${slug}`)
      .then((p) => setPost(p))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-32">
        <span className="text-[12px] uppercase tracking-[0.2em] text-muted">{t('common.loading')}…</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5 pt-32">
        <div className="text-center">
          <p className="display text-4xl">404</p>
          <Link
            to="/journal"
            className="mt-6 inline-block rounded-full border border-line-strong px-5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-surface-soft"
          >
            ← {t('nav.journal')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <Reveal>
          <Link
            to="/journal"
            className="text-[12.5px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-fg"
          >
            ← {t('nav.journal')}
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display mt-6 text-[clamp(2rem,5vw,3.4rem)] font-medium">{post.title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-[12.5px] tracking-[0.04em] text-muted">{formatDate(post.created_at, lang)}</p>
        </Reveal>
        {post.cover && (
          <Reveal delay={0.12}>
            <div className="mt-9 overflow-hidden rounded-[26px] border border-line">
              <img src={post.cover} alt={post.title} className="w-full object-cover" />
            </div>
          </Reveal>
        )}
        <Reveal delay={0.14}>
          <div className="mt-10">
            <CorpMarkdown markdown={post.body_md ?? ''} />
          </div>
        </Reveal>
      </div>
    </article>
  );
}
