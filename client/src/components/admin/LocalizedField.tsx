import { useState } from 'react';
import { googleTranslate } from '../../i18n/translate';

export type LocalizedPair = { ru: string; en: string };

/**
 * A text field with two language slots (RU / EN) and a one-click
 * auto-translation button — you only write in one language and let Google
 * Translate fill the other one.
 */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  hint,
  placeholder,
  maxLength,
}: {
  label: string;
  value: LocalizedPair;
  onChange: (next: LocalizedPair) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const [busy, setBusy] = useState<'ru' | 'en' | null>(null);
  const [error, setError] = useState('');

  async function translateInto(target: 'ru' | 'en') {
    const source = target === 'ru' ? 'en' : 'ru';
    const text = (value[source] ?? '').trim();
    if (!text) {
      setError(`Сначала заполните ${source.toUpperCase()}`);
      return;
    }
    setBusy(target);
    setError('');
    try {
      const translated = await googleTranslate(text, target, source);
      onChange({ ...value, [target]: translated });
    } catch {
      setError('Перевод недоступен — попробуйте ещё раз');
    } finally {
      setBusy(null);
    }
  }

  const rows_ = (
    [
      ['ru', 'RU'] as const,
      ['en', 'EN'] as const,
    ]
  );

  return (
    <div className="block">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-muted/80">{label}</span>
        {error && <span className="text-[11px] text-muted">{error}</span>}
      </div>

      <div className="mt-1.5 space-y-1.5">
        {rows_.map(([lang, badge]) => (
          <div key={lang} className="group relative flex items-start gap-2">
            <span className="mt-3 w-6 shrink-0 text-[10px] font-semibold tracking-[0.1em] text-muted/60">
              {badge}
            </span>
            {multiline ? (
              <textarea
                value={value[lang] ?? ''}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full resize-y rounded-[14px] border border-line bg-bg/60 px-3.5 py-2.5 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-muted/40 focus:border-line-strong"
              />
            ) : (
              <input
                value={value[lang] ?? ''}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full rounded-[14px] border border-line bg-bg/60 px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-muted/40 focus:border-line-strong"
              />
            )}
            <button
              type="button"
              onClick={() => translateInto(lang)}
              disabled={busy !== null}
              title={`Перевести из ${lang === 'ru' ? 'EN' : 'RU'}`}
              className="mt-2 shrink-0 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40"
            >
              {busy === lang ? '…' : `⇄ ${lang === 'ru' ? 'EN' : 'RU'}`}
            </button>
          </div>
        ))}
      </div>
      {hint && <span className="mt-1.5 block text-[11px] text-muted/60">{hint}</span>}
    </div>
  );
}
