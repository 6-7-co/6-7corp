import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block font-mono text-[10px] text-white/30">{hint}</span>}
    </label>
  );
}

const inputCls =
  'mt-2 w-full border-b border-white/20 bg-ink-900/60 px-1 py-2.5 font-mono text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y leading-relaxed ${props.className ?? ''}`} />;
}

/** Save button that briefly reports success. */
export function SaveButton({
  onClick,
  disabled,
  label,
  saved,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  saved?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled}
        className="rounded-full border border-white bg-white px-6 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-black transition-colors hover:bg-transparent hover:text-white disabled:opacity-40"
      >
        {label}
      </button>
      <AnimatePresence>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[11px] uppercase tracking-wider text-white/60"
          >
            ✓ Saved
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Simple confirmation modal for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-ink-800 p-6"
          >
            <p className="font-display text-lg font-semibold">{title}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onCancel} className="border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/70 hover:border-white">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="border border-white bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-black hover:bg-transparent hover:text-white"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small hook returning a saved flag that auto-resets. */
export function useSaved(duration = 2200) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), duration);
    return () => clearTimeout(t);
  }, [saved, duration]);
  return { saved, setSaved };
}
