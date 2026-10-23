import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminHeader, Field, TextInput, SaveButton, useSaved } from './ui';
import { LocalizedField, type LocalizedPair } from './LocalizedField';
import { useI18n } from '../../i18n';
import type { Settings, StatItem } from '../../context/ContentContext';

const boxCls = 'rounded-[22px] border border-line bg-surface p-5 sm:p-6';
const cardTitle = 'text-[12px] font-semibold uppercase tracking-[0.16em] text-muted';

/**
 * Site content editor: everything a non-developer is likely to change —
 * company info, hero copy, contacts, client list and the stats card.
 * Localised text is written once and auto-translated into the other language.
 */
export function AdminSettings() {
  const { t } = useI18n();
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const { saved, setSaved } = useSaved();

  useEffect(() => {
    api
      .get<Settings>('/api/settings')
      .then((s) =>
        setForm({
          ...s,
          clients: Array.isArray(s.clients) ? s.clients : [],
          stats: Array.isArray(s.stats) ? s.stats : [],
        }),
      )
      .catch(() => setError('Не удалось загрузить настройки'));
  }, []);

  if (!form) {
    return (
      <div>
        <AdminHeader title={t('admin.settings')} />
        <p className="mt-6 text-[13px] text-muted">{error || `${t('common.loading')}…`}</p>
      </div>
    );
  }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  /** Read a localised pair (`<base>_ru` / `<base>_en`) as an object. */
  const pair = (base: string): LocalizedPair => {
    const rec = form as unknown as Record<string, string>;
    return { ru: rec[`${base}_ru`] ?? '', en: rec[`${base}_en`] ?? '' };
  };

  /** Write a localised pair back onto the flat settings object. */
  const setPair = (base: string) => (next: LocalizedPair) =>
    setForm((f) =>
      f
        ? {
            ...f,
            [`${base}_ru`]: next.ru,
            [`${base}_en`]: next.en,
          }
        : f,
    );

  const setStat = (i: number, patch: Partial<StatItem>) =>
    setForm((f) =>
      f ? { ...f, stats: f.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) } : f,
    );

  const setClient = (i: number, value: string) =>
    setForm((f) => (f ? { ...f, clients: f.clients.map((c, idx) => (idx === i ? value : c)) } : f));

  async function save() {
    if (!form) return;
    setError('');
    try {
      await api.put('/api/settings', {
        ...form,
        clients: form.clients.map((c) => c.trim()).filter(Boolean),
        stats: form.stats.filter((s) => s.value.trim()),
      });
      setSaved(true);
    } catch {
      setError('Не удалось сохранить — проверьте поля (например, email).');
    }
  }

  return (
    <div className="pb-24">
      <AdminHeader
        title={t('admin.settings')}
        subtitle="Тексты, контакты, клиенты и цифры на главной"
        actions={<SaveButton onClick={save} label={t('common.save')} saved={saved} />}
      />

      {error && <p className="mt-4 text-[12.5px] text-muted">{error}</p>}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {/* ------------------------------------------------ company ---- */}
        <section className={boxCls}>
          <h2 className={cardTitle}>Компания</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Название" hint="Показывается в шапке, футере и заголовке вкладки">
              <TextInput value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="hello@company.com"
                />
              </Field>
              <Field label="Год основания" hint="Показывается только в админке">
                <TextInput
                  value={form.established}
                  onChange={(e) => set('established', e.target.value)}
                  placeholder="2019"
                />
              </Field>
            </div>
            <LocalizedField
              label="Слоган"
              value={pair('tagline')}
              onChange={setPair('tagline')}
              maxLength={300}
              placeholder="Короткая фраза о студии"
            />
            <LocalizedField
              label="Описание компании"
              value={pair('description')}
              onChange={setPair('description')}
              multiline
              rows={4}
              maxLength={2000}
            />
          </div>
        </section>

        {/* --------------------------------------------------- hero ---- */}
        <section className={boxCls}>
          <h2 className={cardTitle}>Первый экран</h2>
          <p className="mt-2 text-[12px] text-muted/70">
            Напишите текст в одном языке и нажмите <span className="text-fg">⇄</span> — второй переведётся сам.
          </p>
          <div className="mt-4 grid gap-4">
            <LocalizedField
              label="Надзаголовок"
              value={pair('hero_eyebrow')}
              onChange={setPair('hero_eyebrow')}
              maxLength={160}
            />
            <LocalizedField
              label="Заголовок — строка 1"
              value={pair('hero_line1')}
              onChange={setPair('hero_line1')}
              maxLength={60}
              hint="Строка 2 выделяется градиентом"
            />
            <LocalizedField
              label="Заголовок — строка 2"
              value={pair('hero_line2')}
              onChange={setPair('hero_line2')}
              maxLength={60}
            />
            <LocalizedField
              label="Заголовок — строка 3"
              value={pair('hero_line3')}
              onChange={setPair('hero_line3')}
              maxLength={60}
            />
            <LocalizedField
              label="Описание под заголовком"
              value={pair('hero_description')}
              onChange={setPair('hero_description')}
              multiline
              rows={3}
              maxLength={600}
            />
            <LocalizedField
              label="Подпись над клиентами"
              value={pair('hero_trusted')}
              onChange={setPair('hero_trusted')}
              maxLength={200}
            />
          </div>
        </section>

        {/* ----------------------------------------------- contacts ---- */}
        <section className={boxCls}>
          <h2 className={cardTitle}>Контакты</h2>
          <div className="mt-4 grid gap-4">
            <LocalizedField
              label="География"
              value={pair('location')}
              onChange={setPair('location')}
              maxLength={160}
              placeholder="Стокгольм · удалённо"
            />
            <Field label="Telegram" hint="Полная ссылка, например https://t.me/username">
              <TextInput
                value={form.telegram}
                onChange={(e) => set('telegram', e.target.value)}
                placeholder="https://t.me/username"
              />
            </Field>
            <Field label="GitHub">
              <TextInput
                value={form.github}
                onChange={(e) => set('github', e.target.value)}
                placeholder="https://github.com/org"
              />
            </Field>
          </div>
        </section>

        {/* ------------------------------------------------ clients ---- */}
        <section className={boxCls}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className={cardTitle}>Клиенты и партнёры</h2>
              <p className="mt-2 text-[12px] text-muted/70">
                Названия в строке под первым экраном. Логотипы-картинки не нужны — достаточно названий.
              </p>
            </div>
            <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
              {form.clients.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {form.clients.map((client, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput
                  value={client}
                  onChange={(e) => setClient(i, e.target.value)}
                  placeholder="Название компании"
                  noMargin
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => (f ? { ...f, clients: f.clients.filter((_, idx) => idx !== i) } : f))
                  }
                  className="shrink-0 rounded-full border border-line px-3 py-2 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                  aria-label="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}
            {form.clients.length === 0 && (
              <p className="text-[12.5px] text-muted/70">Пока пусто — на сайте будет показан стандартный список.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setForm((f) => (f ? { ...f, clients: [...f.clients, ''] } : f))}
            disabled={form.clients.length >= 24}
            className="mt-3 rounded-full border border-line px-4 py-2 text-[12.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40"
          >
            + Добавить компанию
          </button>
        </section>

        {/* -------------------------------------------------- stats ---- */}
        <section className={`${boxCls} xl:col-span-2`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className={cardTitle}>Цифры на главной</h2>
              <p className="mt-2 text-[12px] text-muted/70">
                Карточка под первым экраном. Обычно 3 значения — можно оставить и меньше.
              </p>
            </div>
            <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
              {form.stats.length}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {form.stats.map((stat, i) => (
              <div key={i} className="rounded-[18px] border border-line p-4">
                <div className="flex items-end gap-3">
                  <div className="w-28 shrink-0">
                    <Field label="Значение">
                      <TextInput
                        value={stat.value}
                        onChange={(e) => setStat(i, { value: e.target.value })}
                        placeholder="150+"
                      />
                    </Field>
                  </div>
                  <div className="min-w-0 flex-1">
                    <LocalizedField
                      label="Подпись"
                      value={{ ru: stat.label_ru, en: stat.label_en }}
                      onChange={(next) => setStat(i, { label_ru: next.ru, label_en: next.en })}
                      maxLength={120}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => (f ? { ...f, stats: f.stats.filter((_, idx) => idx !== i) } : f))}
                    className="mb-1 shrink-0 rounded-full border border-line px-3 py-2 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                    aria-label="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {form.stats.length === 0 && (
              <p className="text-[12.5px] text-muted/70">Пока пусто — будет показан стандартный набор цифр.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setForm((f) =>
                f ? { ...f, stats: [...f.stats, { value: '', label_ru: '', label_en: '' }] } : f,
              )
            }
            disabled={form.stats.length >= 6}
            className="mt-3 rounded-full border border-line px-4 py-2 text-[12.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40"
          >
            + Добавить цифру
          </button>
        </section>
      </div>

      <div className="sticky bottom-4 mt-6 flex items-center gap-3 rounded-[18px] border border-line bg-bg/85 p-3 backdrop-blur-xl">
        <SaveButton onClick={save} label={t('common.save')} saved={saved} />
        <p className="text-[12px] text-muted/70">
          Изменения появятся на сайте сразу после сохранения.
        </p>
      </div>
    </div>
  );
}
