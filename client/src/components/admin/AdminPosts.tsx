import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CorpMarkdown } from '../../lib/markdown';
import { AdminHeader, Field, TextInput, TextArea, SaveButton, ConfirmDialog, useSaved } from './ui';
import { MediaPicker } from './MediaPicker';
import { useI18n } from '../../i18n';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  body_md: string;
  published: number;
  created_at: string;
};

type Form = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  body_md: string;
  published: boolean;
};

const EMPTY: Form = {
  id: 0, title: '', slug: '', excerpt: '', cover: null, body_md: '', published: true,
};

function toForm(p: Post): Form {
  return {
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt,
    cover: p.cover, body_md: p.body_md ?? '', published: Boolean(p.published),
  };
}

export function AdminPosts() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [showPreview, setShowPreview] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const { saved, setSaved } = useSaved();
  const list = useSaved();

  async function load() {
    const data = await api.get<Post[]>('/api/posts');
    setPosts(data);
    if (data.length && form.id === 0) setForm(toForm(data[0]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(p: Post) {
    setForm(toForm(p));
    setShowPreview(false);
  }

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    const body = {
      title: form.title,
      excerpt: form.excerpt,
      bodyMd: form.body_md,
      cover: form.cover,
      published: form.published,
    };
    if (form.id) await api.put(`/api/posts/${form.id}`, body);
    else await api.post('/api/posts', body);
    setSaved(true);
    await load();
  }

  async function remove() {
    if (toDelete === null) return;
    await api.del(`/api/posts/${toDelete}`);
    setToDelete(null);
    if (form.id === toDelete) setForm({ ...EMPTY });
    await load();
    list.setSaved(true);
  }

  return (
    <div>
      <AdminHeader
        title={t('admin.posts')}
        subtitle={`${posts.length} ${t('admin.posts').toLowerCase()}`}
        actions={
          <button
            onClick={() => setForm({ ...EMPTY })}
            className="rounded-full border border-line-strong px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-fg/80 hover:border-line-strong hover:text-fg"
          >
            + {t('admin.new')}
          </button>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-2">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => select(p)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                form.id === p.id ? 'border-line-strong bg-surface' : 'border-line hover:border-line-strong'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-sm font-semibold text-fg">{p.title}</span>
                <span className={`font-mono text-[10px] uppercase ${p.published ? 'text-muted' : 'text-muted/70'}`}>
                  {p.published ? 'published' : 'draft'}
                </span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-muted">/{p.slug}</div>
            </button>
          ))}
          {list.saved && <p className="font-mono text-[10px] text-muted">✓</p>}
        </div>

        <div className="rounded-[22px] border border-line p-6">
          <div className="grid gap-5">
            <Field label={t('admin.title')}>
              <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Post title" />
            </Field>
            <Field label={t('admin.excerpt')}>
              <TextInput value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="Short summary" />
            </Field>
            <Field label={t('admin.cover')}>
              <MediaPicker value={form.cover} onChange={(v) => set('cover', v)} />
            </Field>

            <div className="flex items-center justify-between">
              <Field label={t('admin.body')}>
                <span className="mt-2.5 font-mono text-[10px] text-muted">Markdown supported · images via ![](url)</span>
              </Field>
              <button
                onClick={() => setShowPreview((s) => !s)}
                className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg/80 hover:border-line-strong"
              >
                {showPreview ? t('admin.preview') : 'Edit'}
              </button>
            </div>

            {showPreview ? (
              <div className="rounded-[18px] border border-line bg-ink-900 p-5">
                <CorpMarkdown markdown={form.body_md} />
              </div>
            ) : (
              <TextArea
                value={form.body_md}
                onChange={(e) => set('body_md', e.target.value)}
                rows={12}
                className="font-mono"
                placeholder="## Write something\n\nUse **markdown**…"
              />
            )}

            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="h-4 w-4 accent-white" />
              <span className="font-mono text-xs uppercase tracking-wider text-fg/80">{t('admin.publish')}</span>
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            {form.id ? (
              <button onClick={() => setToDelete(form.id)} className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg">
                {t('common.delete')}
              </button>
            ) : <span />}
            <SaveButton onClick={save} label={t('common.save')} saved={saved} disabled={!form.title} />
          </div>
        </div>
      </div>

      <ConfirmDialog open={toDelete !== null} title={t('common.confirmDelete')} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
