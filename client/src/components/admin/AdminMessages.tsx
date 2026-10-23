import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminHeader, ConfirmDialog, useSaved } from './ui';
import { useI18n } from '../../i18n';

type Message = {
  id: number;
  name: string;
  email: string;
  content: string;
  content_en?: string | null;
  content_ru?: string | null;
  created_at: string;
};

export function AdminMessages() {
  const { t } = useI18n();
  const [items, setItems] = useState<Message[]>([]);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const { saved, setSaved } = useSaved();

  async function load() {
    setItems(await api.get<Message[]>('/api/messages'));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove() {
    if (!toDelete) return;
    await api.del(`/api/messages/${toDelete.id}`);
    setToDelete(null);
    await load();
    setSaved(true);
  }

  return (
    <div>
      <AdminHeader title={t('admin.messages')} subtitle={`${items.length} ${t('admin.messages').toLowerCase()}`} />
      <div className="mt-8 space-y-3">
        {items.length === 0 && <p className="font-mono text-sm text-white/40">{t('common.empty')}</p>}
        {items.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-sm font-semibold text-white">{m.name}</span>
                <a href={`mailto:${m.email}`} className="ml-3 font-mono text-[11px] text-white/45 hover:text-white/70">{m.email}</a>
              </div>
              <span className="font-mono text-[10px] text-white/35">{m.created_at?.slice(0, 19).replace('T', ' ')}</span>
            </div>
            <div className="mt-3 space-y-2">
              <p className="font-mono text-sm text-white/80">{m.content}</p>
              {m.content_en && m.content_en !== m.content && (
                <p className="border-l border-white/15 pl-3 font-mono text-xs text-white/45">EN: {m.content_en}</p>
              )}
              {m.content_ru && m.content_ru !== m.content && (
                <p className="border-l border-white/15 pl-3 font-mono text-xs text-white/45">RU: {m.content_ru}</p>
              )}
            </div>
            <div className="mt-4">
              <button onClick={() => setToDelete(m)} className="font-mono text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70">{t('common.delete')}</button>
            </div>
          </div>
        ))}
        {saved && <p className="font-mono text-[10px] text-white/40">✓</p>}
      </div>
      <ConfirmDialog open={!!toDelete} title={t('common.confirmDelete')} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
