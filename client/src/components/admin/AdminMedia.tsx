import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminHeader, ConfirmDialog } from './ui';
import { MediaPicker } from './MediaPicker';
import { useI18n } from '../../i18n';

type File = { name: string; url: string; size: number };

export function AdminMedia() {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<File | null>(null);
  const [picker, setPicker] = useState<string | null>(null);

  async function load() {
    const data = await api.get<{ files: File[] }>('/api/uploads');
    setFiles(data.files);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove() {
    if (!toDelete) return;
    await api.del(`/api/uploads/${toDelete.name}`);
    setToDelete(null);
    await load();
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch { /* ignore */ }
  }

  return (
    <div>
      <AdminHeader
        title={t('admin.media')}
        subtitle={`${files.length} files`}
        actions={
          <div className="rounded-2xl border border-white/10 p-3">
            <MediaPicker value={picker} onChange={(v) => { setPicker(v); load(); }} label="Quick upload" />
          </div>
        }
      />

      {files.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-white/40">{t('common.empty')}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((f) => (
            <div key={f.name} className="group overflow-hidden rounded-xl border border-white/10">
              <button onClick={() => setPreview(f)} className="block w-full aspect-square bg-ink-800">
                <img src={f.url} alt={f.name} className="h-full w-full object-cover grayscale transition group-hover:grayscale-0" />
              </button>
              <div className="p-2">
                <div className="truncate font-mono text-[10px] text-white/50">{f.name}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => copy(f.url)} className="flex-1 border border-white/15 px-2 py-1 font-mono text-[9px] uppercase text-white/60 hover:border-white">Copy</button>
                  <button onClick={() => setToDelete(f)} className="flex-1 border border-white/15 px-2 py-1 font-mono text-[9px] uppercase text-white/60 hover:border-white">Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-6" onClick={() => setPreview(null)}>
          <img src={preview.url} alt={preview.name} className="max-h-[85vh] max-w-full rounded-xl" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-white/60">{preview.name}</div>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} title={t('common.confirmDelete')} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
