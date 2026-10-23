import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminHeader, Field, TextInput, TextArea, SaveButton, ConfirmDialog, useSaved } from './ui';
import { MediaPicker } from './MediaPicker';
import { useI18n } from '../../i18n';

type Member = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  socials: Record<string, string>;
  order_idx: number;
};

const SOCIAL_KEYS = ['website', 'github', 'telegram', 'youtube', 'x'] as const;

const EMPTY: Member = {
  id: 0, name: '', role: '', bio: '', photo: null, socials: {}, order_idx: 0,
};

export function AdminTeam() {
  const { t } = useI18n();
  const [items, setItems] = useState<Member[]>([]);
  const [form, setForm] = useState<Member>({ ...EMPTY });
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const { saved, setSaved } = useSaved();

  async function load() {
    const data = await api.get<any[]>('/api/team');
    const mapped: Member[] = data.map((x) => ({
      ...x,
      socials: typeof x.socials === 'string' ? safeParse(x.socials) : x.socials,
    }));
    setItems(mapped);
    if (mapped.length && form.id === 0) setForm({ ...mapped[0] });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof Member>(k: K, v: Member[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setSocial(k: string, v: string) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [k]: v } }));
  }

  async function save() {
    const body = {
      name: form.name,
      role: form.role,
      bio: form.bio,
      photo: form.photo,
      socials: form.socials,
      orderIdx: form.order_idx,
    };
    if (form.id) await api.put(`/api/team/${form.id}`, body);
    else await api.post('/api/team', body);
    setSaved(true);
    await load();
  }

  async function remove() {
    if (!toDelete) return;
    await api.del(`/api/team/${toDelete.id}`);
    setToDelete(null);
    if (form.id === toDelete.id) setForm({ ...EMPTY });
    await load();
  }

  return (
    <div>
      <AdminHeader
        title={t('admin.team')}
        subtitle={`${items.length} ${t('admin.team').toLowerCase()}`}
        actions={<button onClick={() => setForm({ ...EMPTY })} className="rounded-full border border-line-strong px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-fg/80 hover:border-line-strong hover:text-fg">+ {t('admin.new')}</button>}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-2">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => setForm({ ...m })}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                form.id === m.id ? 'border-line-strong bg-surface' : 'border-line hover:border-line-strong'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-ink-800 font-mono text-xs text-fg/80">
                {m.photo ? <img src={m.photo} className="h-full w-full object-cover" /> : m.name.slice(0, 1)}
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-fg">{m.name}</div>
                <div className="font-mono text-[10px] text-muted">{m.role}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-[22px] border border-line p-6">
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('admin.name')}><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label={t('admin.role')}><TextInput value={form.role} onChange={(e) => set('role', e.target.value)} /></Field>
            </div>
            <Field label={t('admin.order')}><TextInput type="number" value={form.order_idx} onChange={(e) => set('order_idx', Number(e.target.value))} /></Field>
            <Field label={t('admin.bio')}><TextArea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} /></Field>
            <Field label={t('admin.photo')}><MediaPicker value={form.photo} onChange={(v) => set('photo', v)} /></Field>

            <div>
              <span className="eyebrow">Socials</span>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {SOCIAL_KEYS.map((k) => (
                  <Field key={k} label={k}>
                    <TextInput value={form.socials[k] ?? ''} onChange={(e) => setSocial(k, e.target.value)} placeholder={`https://…`} />
                  </Field>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            {form.id ? (
              <button onClick={() => setToDelete(form)} className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg">{t('common.delete')}</button>
            ) : <span />}
            <SaveButton onClick={save} label={t('common.save')} saved={saved} disabled={!form.name} />
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!toDelete} title={t('common.confirmDelete')} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return {}; }
}
