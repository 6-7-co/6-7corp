import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { api } from '../../lib/api';

/** Upload an image to the server and emit its URL. */
export function MediaPicker({
  value,
  onChange,
  label = 'Image',
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setBusy(true);
    setError('');
    try {
      const res = await api.upload(file);
      onChange(res.url);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {value ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-20 w-20 overflow-hidden rounded-[13px] border border-line bg-ink-800"
            >
              <img src={value} alt="" className="h-full w-full object-cover grayscale" />
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-[13px] border border-dashed border-white/25 text-2xl text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              +
            </button>
          )}
        </AnimatePresence>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="border border-line-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-fg/80 transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40"
          >
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="font-mono text-[11px] text-muted hover:text-fg"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-2 font-mono text-[10px] text-muted">{error}</p>}
      <span className="mt-2 block font-mono text-[10px] text-muted/70">{label} · png, jpg, webp, gif, avif · max 6MB</span>
    </div>
  );
}
