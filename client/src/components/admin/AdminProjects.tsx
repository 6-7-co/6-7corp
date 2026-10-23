import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CorpMarkdown } from '../../lib/markdown';
import { AdminHeader, Field, TextInput, TextArea, SaveButton, ConfirmDialog, useSaved } from './ui';
import { MediaPicker } from './MediaPicker';
import { useI18n } from '../../i18n';

type Project = {
  id: number;
  title: string;
  slug: string;
  client: string;
  year: string;
  tags: string;
  excerpt: string;
  body_md: string;
  cover: string | null;
  link: string | null;
  order_idx: number;
};

const EMPTY: Project = {
  id: 0, title: '', slug: '', client: '', year: '', tags: '', excerpt: '', body_md: '',
  cover: null, link: null, order_idx: 0,
};

export function AdminProjects() {
  const { t } = useI18n();
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState<Project>({ ...EMPTY });
  const [showPreview, setShowPreview] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const { saved, setSaved } = useSaved();

  async function load() {
    const data = await api.get<Project[]>('/api/projects');
    setItems(data);
    if (data.length && form.id === 0) setForm({ ...data[0] });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof Project>(k: K, v: Project[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    const body = {
      title: form.title,
      client: form.client,
      year: form.year,
      tags: form.tags,
      excerpt: form.excerpt,
      bodyMd: form.body_md,
      cover: form.cover,
      link: form.link,
      orderIdx: form.order_idx,
    };
    if (form.id) await api.put(`/api/projects/${form.id}`, body);
    else await api.post('/api/projects', body);
    setSaved(true);
    await load();
  }

  async function remove() {
    if (!toDelete) return;
    await api.del(`/api/projects/${toDelete.id}`);
    setToDelete(null);
    if (form.id === toDelete.id) setForm({ ...EMPTY });
    await load();
  }

  return (
    <div>
      <AdminHeader
        title={t('admin.projects')}
        subtitle={`${items.length} ${t('admin.projects').toLowerCase()}`}
        actions={<button onClick={() => setForm({ ...EMPTY })} className="rounded-full border border-line-strong px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-fg/80 hover:border-line-strong hover:text-fg">+ {t('admin.new')}</button>}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-2">
          {items.map((p) => (
            <button
              key={p.id}
              onClick={() => { setForm({ ...p }); setShowPreview(false); }}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                form.id === p.id ? 'border-line-strong bg-surface' : 'border-line hover:border-line-strong'
              }`}
            >
              <div className="font-display text-sm font-semibold text-fg">{p.title}</div>
              <div className="mt-1 font-mono text-[10px] text-muted">{p.client} · {p.year}</div>
            </button>
          ))}
        </div>

        <div className="rounded-[22px] border border-line p-6">
          <div className="grid gap-5">
            <Field label={t('admin.title')}>
              <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('admin.client')}><TextInput value={form.client} onChange={(e) => set('client', e.target.value)} /></Field>
              <Field label={t('admin.year')}><TextInput value={form.year} onChange={(e) => set('year', e.target.value)} /></Field>
              <Field label={t('admin.order')}><TextInput type="number" value={form.order_idx} onChange={(e) => set('order_idx', Number(e.target.value))} /></Field>
            </div>
            <Field label={t('admin.tags')}>
              <TextInput value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Payments, Fraud, Rust" />
            </Field>
            <Field label={t('admin.excerpt')}>
              <TextInput value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </Field>
            <Field label={t('admin.link')}>
              <TextInput value={form.link ?? ''} onChange={(e) => set('link', e.target.value)} placeholder="https://…" />
            </Field>
            <Field label={t('admin.cover')}>
              <MediaPicker value={form.cover} onChange={(v) => set('cover', v)} />
            </Field>

            <div className="flex items-center justify-between">
              <Field label={t('admin.body')}><span className="mt-2.5 font-mono text-[10px] text-muted">Markdown supported</span></Field>
              <button onClick={() => setShowPreview((s) => !s)} className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg/80 hover:border-line-strong">
                {showPreview ? t('admin.preview') : 'Edit'}
              </button>
            </div>
            {showPreview ? (
              <div className="rounded-[18px] border border-line bg-ink-900 p-5"><CorpMarkdown markdown={form.body_md} /></div>
            ) : (
              <TextArea value={form.body_md} onChange={(e) => set('body_md', e.target.value)} rows={10} className="font-mono" placeholder="## Project description" />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            {form.id ? (
              <button onClick={() => setToDelete(form)} className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg">{t('common.delete')}</button>
            ) : <span />}
            <SaveButton onClick={save} label={t('common.save')} saved={saved} disabled={!form.title} />
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!toDelete} title={t('common.confirmDelete')} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
