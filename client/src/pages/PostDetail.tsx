import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CorpMarkdown } from '../lib/markdown';
import { Reveal } from '../components/Reveal';

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
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Loading…</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-32">
        <div className="text-center">
          <p className="display text-4xl">404</p>
          <Link to="/journal" className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white">
            ← Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="relative pt-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <Link
            to="/journal"
            className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            ← Journal
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display mt-6 text-4xl sm:text-5xl">{post.title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            {post.created_at?.slice(0, 10)}
          </p>
        </Reveal>
        {post.cover && (
          <Reveal delay={0.1}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <img src={post.cover} alt={post.title} className="w-full object-cover grayscale" />
            </div>
          </Reveal>
        )}
        <div className="mt-10">
          <CorpMarkdown markdown={post.body_md ?? ''} />
        </div>
      </div>
    </article>
  );
}
