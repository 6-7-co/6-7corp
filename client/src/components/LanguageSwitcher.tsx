import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { LANGS, useI18n, type Lang } from '../i18n';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find((l) => l.id === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-semibold tracking-[0.04em] text-fg transition-colors hover:bg-surface-soft"
        aria-label="Язык / Language"
        aria-expanded={open}
      >
        {compact ? current.short : current.label}
        <span className={`text-[9px] text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="glass absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-[18px] p-1.5"
          >
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLang(l.id as Lang);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-[13px] transition-colors hover:bg-surface-soft ${
                  l.id === lang ? 'text-fg' : 'text-muted'
                }`}
              >
                <span>{l.label}</span>
                <span className="text-[10px] tracking-[0.1em]">{l.short}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
